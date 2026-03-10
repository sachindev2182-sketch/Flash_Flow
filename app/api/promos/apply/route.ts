import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { connectDB } from '@/lib/db';
import { adminAuth } from '@/lib/firebase-admin';
import PromoCode, { IPromoCode } from '@/models/PromoCode';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Verify user authentication
    const token = (await cookies()).get('authToken')?.value;
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // verify session cookie using Firebase Admin
    let decoded: any;
    try {
      decoded = await adminAuth.verifySessionCookie(token, true);
    } catch (err) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const { code, cartTotal } = await request.json();

    // debug logging
    console.log('apply promo received', { code, cartTotal, user: decoded });

    if (!code || typeof cartTotal !== 'number') {
      console.warn('missing code or cartTotal', { code, cartTotal });
      return NextResponse.json(
        { error: 'Promo code and cart total are required' },
        { status: 400 }
      );
    }

    // Find the promo code
    const promo = await PromoCode.findOne({ code: code.toUpperCase() }) as IPromoCode | null;
    if (!promo) {
      console.warn('invalid promo code', code);
      return NextResponse.json(
        { error: 'Invalid promo code' },
        { status: 400 }
      );
    }

    // Check if promo is active
    if (!promo.isActive) {
      console.warn('promo not active', promo.code);
      return NextResponse.json(
        { error: 'Promo code is not active' },
        { status: 400 }
      );
    }

    // Check expiry
    const now = new Date();
    if (promo.expiryDate && promo.expiryDate < now) {
      console.warn('promo expired', promo.code, promo.expiryDate, now);
      return NextResponse.json(
        { error: 'Promo code has expired' },
        { status: 400 }
      );
    }

    // Check start date
    if (promo.startDate && promo.startDate > now) {
      console.warn('promo not started', promo.code, promo.startDate, now);
      return NextResponse.json(
        { error: 'Promo code is not yet valid' },
        { status: 400 }
      );
    }

    // Check usage limit
    if (promo.usageLimit && promo.usedCount >= promo.usageLimit) {
      console.warn('promo global usage reached', promo.code, promo.usedCount, promo.usageLimit);
      return NextResponse.json(
        { error: 'Promo code usage limit reached' },
        { status: 400 }
      );
    }

    // Check minimum order amount
    if (promo.minOrderAmount && cartTotal < promo.minOrderAmount) {
      console.warn('min order not met', cartTotal, promo.minOrderAmount);
      return NextResponse.json(
        { error: `Minimum order amount of ₹${promo.minOrderAmount} required` },
        { status: 400 }
      );
    }

    // Check user usage limit
    if (promo.userUsageLimit) {
      const userUsage = promo.usedBy?.find((usage: any) => usage.userId.toString() === decoded.user_id || decoded.uid)?.count || 0;
      if (userUsage >= promo.userUsageLimit) {
        console.warn('user usage exceeded', decoded.user_id || decoded.uid, userUsage, promo.userUsageLimit);
        return NextResponse.json(
          { error: 'You have already used this promo code the maximum allowed times' },
          { status: 400 }
        );
      }
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (promo.discountType === 'percentage') {
      discountAmount = (cartTotal * promo.discountValue) / 100;
    } else {
      discountAmount = promo.discountValue;
    }

    // Cap discount if maximum discount is set
    if (promo.maxDiscountAmount && discountAmount > promo.maxDiscountAmount) {
      discountAmount = promo.maxDiscountAmount;
    }

    const finalTotal = cartTotal - discountAmount;

    const responsePayload = {
      success: true,
      promoCode: promo.code,
      discountType: promo.discountType,
      discountValue: promo.discountValue,
      discountAmount,
      finalTotal,
    };
    console.log('promo applied successfully', responsePayload);
    return NextResponse.json(responsePayload);

  } catch (error) {
    console.error('Error applying promo code:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
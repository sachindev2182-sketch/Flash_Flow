import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { connectDB } from '@/lib/db';
import { adminAuth } from '@/lib/firebase-admin';
import PromoCode, { IPromoCode } from '@/models/PromoCode';
import User from '@/models/User';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    console.log('Connected to DB for promo fetch');

    // Verify user authentication (optional - you can show promos to everyone)
    const token = (await cookies()).get('authToken')?.value;
    let userId = null;
    
    if (token) {
      try {
        const decoded = await adminAuth.verifySessionCookie(token, true);
        const user = await User.findOne({ email: decoded.email });
        if (user) {
          userId = user._id;
          console.log('User authenticated:', userId);
        }
      } catch (err) {
        console.log('User not authenticated, showing public promos');
      }
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const minOrderAmount = parseFloat(searchParams.get('minOrder') || '0');
    const category = searchParams.get('category');

    console.log('Fetching promos with params:', { limit, minOrderAmount, category });

    // Build query for active and valid promo codes
    const now = new Date();
    const query: any = {
      isActive: true,
      startDate: { $lte: now },
      expiryDate: { $gt: now },
    };

    // Don't filter by minOrderAmount if it's 0 (fetch all)
    if (minOrderAmount > 0) {
      query.minOrderAmount = { $lte: minOrderAmount };
    }

    // Filter by applicable categories if provided
    if (category) {
      query.$or = [
        { applicableCategories: null },
        { applicableCategories: { $in: [category] } }
      ];
    }

    console.log('MongoDB Query:', JSON.stringify(query));

    // Get promo codes
    const promos = await PromoCode.find(query)
      .sort({ minOrderAmount: 1 })
      .limit(limit)
      .lean();

    console.log(`Found ${promos.length} promos`);

    // Process each promo to add user-specific info
    const processedPromos = await Promise.all(promos.map(async (promo) => {
      const typedPromo = promo as IPromoCode & { _id: mongoose.Types.ObjectId };
      
      // Check if user has reached usage limit
      let userCanUse = true;
      let userUsageCount = 0;

      if (userId && typedPromo.usedBy) {
        const userUsage = typedPromo.usedBy.find(
          (u) => u.userId.toString() === userId.toString()
        );
        if (userUsage) {
          userUsageCount = userUsage.count;
          userCanUse = userUsage.count < typedPromo.userUsageLimit;
        }
      }

      // Format the promo for display
      return {
        id: typedPromo._id.toString(),
        code: typedPromo.code,
        discountType: typedPromo.discountType,
        discountValue: typedPromo.discountValue,
        minOrderAmount: typedPromo.minOrderAmount,
        maxDiscountAmount: typedPromo.maxDiscountAmount || undefined,
        description: getPromoDescription(typedPromo),
        userCanUse,
        userUsageCount,
        userUsageLimit: typedPromo.userUsageLimit,
        expiryDate: typedPromo.expiryDate,
      };
    }));

    console.log('Processed promos:', processedPromos.length);

    // Return response with CORS headers
    return NextResponse.json({
      success: true,
      promos: processedPromos,
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });

  } catch (error) {
    console.error('Error fetching active promos:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      }
    );
  }
}

function getPromoDescription(promo: IPromoCode): string {
  const discountText = promo.discountType === 'percentage' 
    ? `${promo.discountValue}% off` 
    : `₹${promo.discountValue} off`;
  
  let description = discountText;
  
  if (promo.minOrderAmount > 0) {
    description += ` on orders above ₹${promo.minOrderAmount}`;
  }
  
  if (promo.maxDiscountAmount && promo.maxDiscountAmount > 0) {
    description += ` (max discount ₹${promo.maxDiscountAmount})`;
  }
  
  return description;
}
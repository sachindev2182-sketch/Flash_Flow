import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const currentProductId = searchParams.get("currentProductId");
    const limit = parseInt(searchParams.get("limit") || "10");

    let filter: any = {};

    // Exclude current product if provided
    if (currentProductId && mongoose.Types.ObjectId.isValid(currentProductId)) {
      filter._id = { $ne: currentProductId };
    }

    // Get all products (or a large sample) and shuffle
    const allProducts = await Product.find(filter).lean();

    // Fisher-Yates shuffle algorithm
    const shuffled = [...allProducts];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // Take first 'limit' products
    const selectedProducts = shuffled.slice(0, Math.min(limit, shuffled.length));

    const transformedProducts = selectedProducts.map(product => ({
      _id: product._id.toString(),
      title: product.title,
      description: product.description,
      price: product.price,
      image: product.image,
      category: product.category,
    }));

    return NextResponse.json({ products: transformedProducts });
  } catch (error) {
    console.error("Error fetching similar products:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
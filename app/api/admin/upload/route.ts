// import { NextRequest, NextResponse } from "next/server";
// import { cookies } from "next/headers";
// import { adminAuth } from "@/lib/firebase-admin";
// import { connectDB } from "@/lib/db";
// import User from "@/models/User";
// import { writeFile, mkdir } from 'fs/promises';
// import path from 'path';
// import { v4 as uuidv4 } from 'uuid';

// export async function POST(req: NextRequest) {
//   try {
//     const token = (await cookies()).get("authToken")?.value;
//     if (!token) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     let decoded;
//     try {
//       decoded = await adminAuth.verifySessionCookie(token, true);
//     } catch (err) {
//       return NextResponse.json({ error: "Invalid token" }, { status: 401 });
//     }

//     await connectDB();

//     // Check if user is admin
//     const user = await User.findOne({ email: decoded.email });
//     if (!user || user.role !== "admin") {
//       return NextResponse.json({ error: "Forbidden" }, { status: 403 });
//     }

//     // Parse form data
//     const formData = await req.formData();
//     const file = formData.get('image') as File | null;

//     if (!file) {
//       return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
//     }

//     // Validate file type
//     const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/avif'];
//     if (!allowedTypes.includes(file.type)) {
//       return NextResponse.json(
//         { error: "Only image files are allowed (jpeg, jpg, png, gif, webp, avif)" },
//         { status: 400 }
//       );
//     }

//     // Validate file size (5MB)
//     if (file.size > 5 * 1024 * 1024) {
//       return NextResponse.json(
//         { error: "File size too large. Maximum 5MB allowed." },
//         { status: 400 }
//       );
//     }

//     // Generate unique filename
//     const bytes = await file.arrayBuffer();
//     const buffer = Buffer.from(bytes);
    
//     const ext = file.name.split('.').pop();
//     const filename = `product-${uuidv4()}.${ext}`;
    
//     // Ensure upload directory exists
//     const uploadDir = path.join(process.cwd(), 'public/uploads');
//     await mkdir(uploadDir, { recursive: true });
    
//     // Save file
//     const filepath = path.join(uploadDir, filename);
//     await writeFile(filepath, buffer);

//     // Return file info
//     return NextResponse.json({
//       success: true,
//       file: {
//         filename,
//         originalName: file.name,
//         size: file.size,
//         url: `/uploads/${filename}`,
//       },
//     });

//   } catch (error) {
//     console.error("Upload error:", error);
//     return NextResponse.json(
//       { error: error instanceof Error ? error.message : "Upload failed" },
//       { status: 500 }
//     );
//   }
// }



// CLOUDE VERSION 

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase-admin";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  try {
    const token = (await cookies()).get("authToken")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let decoded;
    try {
      decoded = await adminAuth.verifySessionCookie(token, true);
    } catch (err) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await connectDB();

    // Check if user is admin
    const user = await User.findOne({ email: decoded.email });
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Parse form data
    const formData = await req.formData();
    const file = formData.get('image') as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/avif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Only image files are allowed (jpeg, jpg, png, gif, webp, avif)" },
        { status: 400 }
      );
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size too large. Maximum 5MB allowed." },
        { status: 400 }
      );
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64String = buffer.toString('base64');
    const dataURI = `data:${file.type};base64,${base64String}`;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'products',
      public_id: `product-${Date.now()}`,
    });

    // Return file info
    return NextResponse.json({
      success: true,
      file: {
        filename: result.public_id,
        originalName: file.name,
        size: file.size,
        url: result.secure_url,
      },
    });

  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    );
  }
}
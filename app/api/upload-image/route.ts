import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { image } = body;

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const uploadRes = await cloudinary.uploader.upload(image, {
      upload_preset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
    });

    return NextResponse.json({ url: uploadRes.secure_url });
  } catch (err) {
    console.error('[UPLOAD_IMAGE_ERROR]', err);

    // 🛑 THIS is the fix: always return proper JSON
    return NextResponse.json(
      { error: 'Upload failed', details: String(err) },
      { status: 500 }
    );
  }
}

// app/api/upload-image/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { image } = await req.json();

  if (!image) {
    return new NextResponse("No image provided", { status: 400 });
  }

  try {
    const formData = new FormData();
    formData.append("file", image); // base64-encoded string (e.g. "data:image/jpeg;base64,...")
    formData.append(
      "upload_preset",
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
    );

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData, // ✅ must be FormData
      }
    );

    const data = await res.json();
    console.log("📦 Upload API response:", data);

    if (!data.secure_url) {
      return new NextResponse("Failed to upload image", { status: 500 });
    }

    return NextResponse.json({ url: data.secure_url });
  } catch (err) {
    console.error("❌ Upload error:", err);
    return new NextResponse("Upload failed", { status: 500 });
  }
}

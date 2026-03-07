import { NextResponse } from "next/server";
import { isCloudinaryConfigured, uploadImageToCloudinary } from "@/lib/cloudinary";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const imageUrl = String(body?.imageUrl ?? "").trim();

    if (!imageUrl) {
      return NextResponse.json({ error: "imageUrl is required" }, { status: 400 });
    }

    if (!/^https?:\/\//i.test(imageUrl)) {
      return NextResponse.json(
        { error: "Only absolute http(s) imageUrl is supported" },
        { status: 400 }
      );
    }

    if (!isCloudinaryConfigured()) {
      return NextResponse.json(
        { error: "Cloudinary is not configured" },
        { status: 503 }
      );
    }

    const uploadResult = await uploadImageToCloudinary(imageUrl);

    return NextResponse.json({
      dataUrl: uploadResult.secureUrl,
      secureUrl: uploadResult.secureUrl,
      publicId: uploadResult.publicId,
      bytes: uploadResult.bytes,
    });
  } catch (error) {
    console.error("persist-image failed", error);
    return NextResponse.json({ error: "Unable to persist image" }, { status: 500 });
  }
}
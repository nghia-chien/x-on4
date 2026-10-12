import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { apiError } from "@/lib/apiError";

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "video/mp4",
  "video/webm",
]);

const IMAGE_MAX = 5 * 1024 * 1024; // 5MB
const VIDEO_MAX = 30 * 1024 * 1024; // 30MB

const MAGIC: Array<{ mime: string; bytes: number[] }> = [
  { mime: "image/jpeg", bytes: [0xff, 0xd8, 0xff] },
  { mime: "image/png", bytes: [0x89, 0x50, 0x4e, 0x47] },
  { mime: "image/webp", bytes: [0x52, 0x49, 0x46, 0x46] }, // RIFF....WEBP
  { mime: "video/mp4", bytes: [0x00, 0x00, 0x00] }, // ftyp box — checked below
  { mime: "video/webm", bytes: [0x1a, 0x45, 0xdf, 0xa3] },
];

function matchesMagic(buffer: Buffer, mime: string): boolean {
  if (mime === "image/webp") {
    return (
      buffer.length >= 12 &&
      buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
      buffer.subarray(8, 12).toString("ascii") === "WEBP"
    );
  }
  if (mime === "video/mp4") {
    // ....ftyp
    return (
      buffer.length >= 8 && buffer.subarray(4, 8).toString("ascii") === "ftyp"
    );
  }
  const sig = MAGIC.find((m) => m.mime === mime);
  if (!sig) return false;
  if (buffer.length < sig.bytes.length) return false;
  return sig.bytes.every((b, i) => buffer[i] === b);
}

function safeExt(mime: string): string {
  switch (mime) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "video/mp4":
      return "mp4";
    case "video/webm":
      return "webm";
    default:
      return "bin";
  }
}

export async function POST(req: NextRequest) {
  const { errorResponse } = await requireAuth(req);
  if (errorResponse) return errorResponse;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file uploaded" },
        { status: 400 }
      );
    }

    const mime = (file.type || "").toLowerCase();
    if (!ALLOWED_MIME.has(mime)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Unsupported file type. Allowed: JPEG, PNG, WEBP, MP4, WEBM.",
        },
        { status: 400 }
      );
    }

    const isVideo = mime.startsWith("video/");
    const maxBytes = isVideo ? VIDEO_MAX : IMAGE_MAX;
    if (file.size <= 0 || file.size > maxBytes) {
      return NextResponse.json(
        {
          success: false,
          message: isVideo
            ? "Video must be between 1 byte and 30MB"
            : "Image must be between 1 byte and 5MB",
        },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    if (!matchesMagic(buffer, mime)) {
      return NextResponse.json(
        {
          success: false,
          message: "File content does not match declared type",
        },
        { status: 400 }
      );
    }

    const safeName = `upload-${Date.now()}.${safeExt(mime)}`;

    const cloudinaryResult = await uploadToCloudinary(
      buffer,
      "xon-nails/uploads"
    );
    if (cloudinaryResult) {
      return NextResponse.json({
        success: true,
        data: {
          url: cloudinaryResult.url,
          name: safeName,
          size: file.size,
          public_id: cloudinaryResult.public_id,
        },
      });
    }

    // Fallback only for images when Cloudinary is not configured
    if (isVideo) {
      return NextResponse.json(
        { success: false, message: "Video upload requires Cloudinary" },
        { status: 503 }
      );
    }

    const base64Data = `data:${mime};base64,${buffer.toString("base64")}`;
    return NextResponse.json({
      success: true,
      data: {
        url: base64Data,
        name: safeName,
        size: file.size,
      },
    });
  } catch (error) {
    return apiError(error, "Failed to upload file");
  }
}

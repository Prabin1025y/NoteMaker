import cloudinary from "@/lib/cloudinary";
import { withErrorHandling } from "@/lib/Error/error-handler";
import requireAuth from "@/lib/requireAuth";
import { Readable } from "stream";

export const POST = withErrorHandling(async (req: Request) => {
    await requireAuth();

    const data = await req.formData();
    const file = data.get("image") as File | null;

    if (!file) {
        return Response.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await new Promise<any>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: "uploads" },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            },
        );

        Readable.from(buffer).pipe(stream);
    });

    return Response.json({
        success: true,
        url: result.secure_url,
        publicId: result.public_id,
    });
});

import cloudinary from "@/lib/cloudinary";
import { withErrorHandling } from "@/lib/Error/error-handler";
import requireAuth from "@/lib/requireAuth";
import { Readable } from "stream";

const uploadImage = async (file: File) => {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    return new Promise<{ url: string; publicId: string }>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: "uploads" },
            (error, result) => {
                if (error) {
                    reject(error);
                    return;
                }

                if (!result) {
                    reject(new Error("Cloudinary returned no upload result"));
                    return;
                }

                resolve({
                    url: result.secure_url,
                    publicId: result.public_id,
                });
            },
        );

        Readable.from(buffer).pipe(stream);
    });
};

export const POST = withErrorHandling(async (req: Request) => {
    await requireAuth();

    const data = await req.formData();
    const imageEntries = data.getAll("images");
    const files = (imageEntries.length > 0
        ? imageEntries
        : data.getAll("image")
    ).filter((entry): entry is File => entry instanceof File);

    if (files.length === 0) {
        return Response.json({ error: "No files uploaded" }, { status: 400 });
    }

    const images = await Promise.all(files.map(uploadImage));

    return Response.json({
        success: true,
        images,
    });
});

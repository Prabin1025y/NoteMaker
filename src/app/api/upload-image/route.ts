import cloudinary from "@/lib/cloudinary";
import { Readable } from "stream";

export async function POST(req: Request) {
    try {
        const data = await req.formData();
        const file = data.get("image") as File | null;

        if (!file) {
            return Response.json(
                { error: "No file uploaded" },
                { status: 400 },
            );
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

        // const uploadDir = path.join(process.cwd(), "public", "uploads");

        // await mkdir(uploadDir, { recursive: true });

        // const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
        // const filePath = path.join(uploadDir, fileName);

        // await writeFile(filePath, buffer);

       return Response.json({
            success: true,
            url: result.secure_url,
            publicId: result.public_id,
        });
    } catch (error) {
        if (process.env.NODE_ENV === "development") console.log(error);

        return Response.json({ error: "Upload failed" }, { status: 500 });
    }
}

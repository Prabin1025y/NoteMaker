import { z } from "zod";

export const pdfExportOptionsSchema = z.object({
    subject: z.boolean().default(true),
    title: z.boolean().default(true),
    author: z.boolean().default(false),
    pageNumbers: z.boolean().default(true),
});

export type PdfExportOptions = z.infer<typeof pdfExportOptionsSchema>;
export const DEFAULT_PDF_EXPORT_OPTIONS = pdfExportOptionsSchema.parse({});

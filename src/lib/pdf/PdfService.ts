import { Page } from "puppeteer";
import { BrowserManager } from "./BrowserManager";
import { PdfToken } from "./PdfToken";
import { PdfRoutes } from "./PdfRoutes";
import { withTimeout } from "../withTimeout";

type GenerateNotePdfInput = {
    noteId: string;
    userId: string;
    signal?: AbortSignal;
};

export class PdfService {
    static async generateNote(
        input: GenerateNotePdfInput,
    ): Promise<Uint8Array> {
        if (input.signal?.aborted) {
            throw new Error("Request aborted.");
        }

        // For Logging
        const requestId = crypto.randomUUID();
        const log = (...args: unknown[]) =>
            console.log(`[PDF ${requestId}]`, ...args);
        const started = performance.now();

        const token = await PdfToken.create({
            purpose: "pdf",
            noteId: input.noteId,
            userId: input.userId,
        });

        return withTimeout(
            BrowserManager.withContext(async (context) => {
                const page = await context.newPage();

                await page.setExtraHTTPHeaders({
                    Authorization: `Bearer ${token}`,
                });

                const url = PdfRoutes.note(input.noteId);

                await this.navigate(page, url);

                if (input.signal?.aborted) {
                    throw new Error("Request aborted.");
                }

                log(`Finished in ${Math.round(performance.now() - started)}ms`);

                return page.pdf({
                    printBackground: true,
                    format: "A4",
                    preferCSSPageSize: true,
                });
            }),
            20_000,
            "PDF generation timed out.",
        );
    }

    private static async navigate(page: Page, url: string) {
        const response = await page.goto(url, {
            waitUntil: "networkidle0",
            timeout: 10000,
        });

        if (!response) {
            throw new Error("No response received");
        }

        if (!response.ok) {
            throw new Error(`Navigation failed (${response.status()})`);
        }

        await page.waitForFunction(() => window.__PDF_READY__ === true, {
            timeout: 10_000,
        });
    }
}

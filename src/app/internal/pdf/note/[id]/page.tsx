import { authenticatePdfRequest } from "@/lib/pdf/authenticatePdfRequest";
import PdfReady from "./PdfReady";

export default async function NotePdfPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    // authentication comes next
    const payload = await authenticatePdfRequest(id);
    // fetch invoice comes next

    return (
        <>
            <PdfReady />

            <main>
                <h1>Note #{id}</h1>

                {/* Invoice component */}
            </main>
        </>
    );
}

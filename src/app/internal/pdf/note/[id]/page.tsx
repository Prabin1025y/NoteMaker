import { authenticatePdfRequest } from "@/lib/pdf/authenticatePdfRequest";
import PdfReady from "./PdfReady";
import { getBlocksFromNoteId } from "@/lib/pdf/getBlocks";
import MainContent from "./MainContent";

export default async function NotePdfPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    // authentication comes next
    await authenticatePdfRequest(id);
    // fetch invoice comes next
    const blocks = await getBlocksFromNoteId(id);

    return (
        <>
            <PdfReady />

            <MainContent blocks={blocks} />
        </>
    );
}

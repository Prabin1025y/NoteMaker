"use client";

import { useEffect } from "react";

export default function PdfReady() {
    useEffect(() => {
        window.__PDF_READY__ = true;
    }, []);

    return null;
}

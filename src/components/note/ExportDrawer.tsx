"use client";

import { useState } from "react";
import { Dialog } from "radix-ui";
import { Lock, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DEFAULT_PDF_EXPORT_OPTIONS,
    PdfExportOptions,
} from "@/lib/pdf/exportOptions";

const fields = [
    ["subject", "Subject name"],
    ["title", "Note title"],
    ["author", "Author name"],
    ["pageNumbers", "Page numbers"],
] as const;

interface ExportDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    isExporting: boolean;
    onExport: (options: PdfExportOptions) => void;
}

export default function ExportDrawer({
    open,
    onOpenChange,
    isExporting,
    onExport,
}: ExportDrawerProps) {
    const [options, setOptions] = useState(DEFAULT_PDF_EXPORT_OPTIONS);

    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-50 bg-black/30" />
                <Dialog.Content className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col border-l border-muted bg-card p-6 text-foreground shadow-xl motion-safe:animate-in motion-safe:slide-in-from-right motion-safe:duration-200">
                    <div className="flex items-center justify-between gap-4">
                        <Dialog.Title className="text-lg font-semibold">Export PDF</Dialog.Title>
                        <Dialog.Close asChild>
                            <Button variant="ghost" size="icon" aria-label="Close export options">
                                <X size={18} />
                            </Button>
                        </Dialog.Close>
                    </div>
                    <Dialog.Description className="mt-2 text-sm text-muted-foreground">
                        Choose what to include in the page headers and footers.
                    </Dialog.Description>
                    <fieldset disabled={isExporting} className="mt-6 space-y-1 overflow-y-auto disabled:opacity-60">
                        <legend className="sr-only">PDF details</legend>
                        {fields.map(([key, label]) => (
                            <label key={key} className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md px-2 text-sm hover:bg-muted">
                                <input
                                    type="checkbox"
                                    checked={options[key]}
                                    onChange={(event) => setOptions({
                                        ...options,
                                        [key]: event.target.checked,
                                    })}
                                    className="h-4 w-4 accent-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                                />
                                {label}
                            </label>
                        ))}
                    </fieldset>
                    <div className="mt-6 border-t border-muted pt-5">
                        <label className="flex items-center gap-3 px-2 text-sm">
                            <input type="checkbox" checked disabled className="h-4 w-4 accent-primary" />
                            Eton Note watermark
                            <Lock size={14} className="ml-auto text-muted-foreground" aria-hidden="true" />
                        </label>
                        <p className="mt-2 px-2 text-xs text-muted-foreground">Always included in exported PDFs.</p>
                    </div>
                    <Button disabled={isExporting} onClick={() => onExport(options)} className="mt-auto w-full">
                        <Upload size={16} />
                        {isExporting ? "Exporting…" : "Download PDF"}
                    </Button>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}

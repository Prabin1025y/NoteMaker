import { BaseEditorDataType } from "@/types/Editor";
import { ImagePlus, Trash2 } from "lucide-react";
import Image from "next/image";
import React, { useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "./ui/button";

export type PreviewFile = File & {
    preview: string;
};

interface ImageDropZoneProps {
    file: PreviewFile | null;
    setFile: (file: PreviewFile | null) => void;
    editorData: Pick<BaseEditorDataType, "title">;
    url?: string;
    showActions?: boolean;
    inline?: boolean;
    onRemoveImage?: () => void;
}

export function ImageDropZone({
    file,
    setFile,
    editorData,
    url = "",
    showActions = true,
    inline = false,
    onRemoveImage,
}: ImageDropZoneProps) {
    const imageSrc = file?.preview || url;
    const onDrop = useCallback((acceptedFiles: File[]) => {
        const uploaded = acceptedFiles[0];
        if (!uploaded) return;

        const withPreview = Object.assign(uploaded, {
            preview: URL.createObjectURL(uploaded),
        });

        if (file) {
            URL.revokeObjectURL(file.preview);
        }
        setFile(withPreview);
    }, [file, setFile]);

    useEffect(() => {
        return () => {
            if (file) URL.revokeObjectURL(file.preview);
        };
    }, [file]);

    const removeImage = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();

        if (file) {
            URL.revokeObjectURL(file.preview);
            setFile(null);
        }
    };

    const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
        onDrop,
        multiple: false,
        autoFocus: true,
        noClick: inline && !!imageSrc,
        noKeyboard: inline && !!imageSrc,
        accept: {
            "image/*": [],
        },
    });

    if (inline) {
        return (
            <figure {...getRootProps()} tabIndex={imageSrc ? -1 : 0} className="relative min-w-0 outline-none">
                <input {...getInputProps()} />
                {imageSrc ? (
                    <>
                        <div className="flex justify-center">
                            <div className="relative max-w-full">
                                {/* Use the same intrinsic sizing as the finished image block. */}
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={imageSrc} alt={editorData.title || "Document image"} className="w-full max-h-[600px] max-w-full object-contain" />
                                <div className="absolute right-2 top-2 z-10 flex max-w-[calc(100%-1rem)] flex-wrap justify-end gap-1 rounded-md border border-muted bg-card p-1 shadow-sm">
                                    <Button size="icon-sm" variant="ghost" aria-label="Replace image" title="Replace image" onClick={open}><ImagePlus size={15} /></Button>
                                    <Button size="icon-sm" variant="ghost" aria-label="Remove image" title="Remove image" onClick={(event) => {
                                        event.stopPropagation();
                                        if (onRemoveImage) onRemoveImage();
                                        else removeImage(event);
                                    }}><Trash2 size={15} /></Button>
                                </div>
                            </div>
                        </div>
                        {editorData.title && (
                            <figcaption className="mx-auto mt-3 max-w-3xl text-center text-sm italic text-muted-foreground">{editorData.title}</figcaption>
                        )}
                    </>
                ) : (
                    <div className={`flex aspect-[16/10] flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-6 text-center ${isDragActive ? "border-accent" : "border-strong"}`}>
                        <ImagePlus className="h-8 w-8 text-muted-foreground" />
                        <h3 className="text-lg font-semibold">Upload an image</h3>
                        <p className="max-w-xs text-sm text-muted-foreground">Drag and drop an image here, or click to browse from your device.</p>
                        <span className="rounded-md border border-strong px-4 py-2 text-sm font-medium text-body">Choose image</span>
                    </div>
                )}
                {isDragActive && imageSrc && (
                    <div className="pointer-events-none absolute inset-0 grid place-items-center rounded-xl border-2 border-accent bg-primary/10 text-sm font-semibold text-primary">Drop to replace image</div>
                )}
            </figure>
        );
    }

    return (
        <div className="w-full flex-1 flex justify-center">
            <div className="w-full max-w-2xl">
                <div
                    {...getRootProps()}
                    className={`
                    group relative overflow-hidden rounded-3xl
                    border transition-colors duration-200
                    cursor-pointer
                    ${
                        isDragActive
                            ? "border-accent ring-4 ring-accent"
                            : "border-muted hover:border-strong"
                    }
                `}
                >
                    <input {...getInputProps()} />

                    {imageSrc ? (
                        <div className="aspect-[16/10] relative">
                            <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                                <Image
                                    className="object-contain h-full py-2"
                                    fill
                                    src={imageSrc}
                                    alt=""
                                />
                            </div>
                            {showActions && <div className="opacity-0 group-hover:opacity-100 absolute inset-0 bg-black/40 transition-opacity duration-700">
                                <div className="flex gap-2 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                    <button className="px-4 py-2 bg-card border border-muted text cursor-pointer rounded-full">
                                        Replace
                                    </button>
                                    <button
                                        onClick={removeImage}
                                        className="px-4 py-2 bg-destructive text-white border border-transparent cursor-pointer rounded-full"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>}
                            <div className="flex items-center justify-center gap-2">
                                <p className="truncate font-medium">
                                    {file ? file.name : editorData.title}
                                </p>

                                {file && <p className="text-sm text-muted-foreground">
                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                </p>}
                            </div>
                        </div>
                    ) : (
                        <div className="aspect-[16/10]">
                            <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                                <div
                                    className="
                                    mb-4 flex h-16 w-16 items-center
                                    justify-center rounded-2xl
                                    bg-background/70
                                "
                                >
                                    <ImagePlus className="h-8 w-8 text-muted-foreground" />
                                </div>

                                <h3 className="text-lg font-semibold">
                                    Upload an image
                                </h3>

                                <p className="mt-2 max-w-xs text-sm text-muted-foreground">
                                    Drag and drop an image here, or click to
                                    browse from your device.
                                </p>

                                <div
                                    className="
                                    mt-6 rounded-xl
                                    border border-strong px-4 py-2 text-sm
                                    font-medium text-body
                                "
                                >
                                    Choose Image
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

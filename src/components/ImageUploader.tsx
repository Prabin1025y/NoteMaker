import { EditorData } from "@/types/Editor";
import { ImagePlus } from "lucide-react";
import Image from "next/image";
import React, { useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";

export type PreviewFile = File & {
    preview: string;
};

interface ImageDropZoneProps {
    file: PreviewFile | null;
    setFile: (file: PreviewFile | null) => void;
    editorData: EditorData;
}

export function ImageDropZone({
    file,
    setFile,
    editorData,
}: ImageDropZoneProps) {
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

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple: false,
        autoFocus: true,
        accept: {
            "image/*": [],
        },
    });

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

                    {file ? (
                        <div className="aspect-[16/10] relative">
                            <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                                <Image
                                    className="object-contain h-full py-2"
                                    fill
                                    src={file.preview}
                                    alt=""
                                />
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 absolute inset-0 bg-black/40 transition-opacity duration-700">
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
                            </div>
                            <div className="flex items-center justify-center gap-2">
                                <p className="truncate font-medium">
                                    {!!file ? file.name : editorData.title}
                                </p>

                                <p className="text-sm text-muted-ink">
                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
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

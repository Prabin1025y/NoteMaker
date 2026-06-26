const blockHeights = [160, 240, 140, 320, 180];

export default function MainPageSkeleton() {
    return (
        <main
            className="flex-1 overflow-y-auto bg-white"
            style={{ fontFamily: "'Inter', sans-serif" }}
        >
            <div className="max-w-5xl mx-auto px-10 py-10">
                <div className="flex flex-col gap-3 animate-pulse">
                    {blockHeights.map((height, index) => (
                        <div
                            key={index}
                            className="border border-gray-200 rounded-xl bg-white p-6"
                            style={{ height }}
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between mb-5">
                                <div className="space-y-3 flex-1">
                                    <div className="h-6 w-56 rounded bg-gray-200" />
                                    <div className="h-4 w-32 rounded bg-gray-100" />
                                </div>

                                <div className="flex gap-2">
                                    <div className="h-8 w-8 rounded-lg bg-gray-200" />
                                    <div className="h-8 w-8 rounded-lg bg-gray-200" />
                                </div>
                            </div>

                            {/* Fake content */}
                            <div className="space-y-3">
                                {Array.from({
                                    length: Math.max(
                                        2,
                                        Math.floor((height - 90) / 28)
                                    ),
                                }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="h-4 rounded bg-gray-200"
                                        style={{
                                            width: `${100 - (i % 4) * 10}%`,
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bottom add-block hint */}
                <div className="mt-4 flex items-center justify-center py-4 border border-dashed border-gray-200 rounded-xl">
                    <div className="h-4 w-56 rounded bg-gray-200 animate-pulse" />
                </div>
            </div>
        </main>
    );
}
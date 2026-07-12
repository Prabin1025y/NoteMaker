const blockHeights = [160, 240, 140, 320, 180];

export default function MainPageSkeleton() {
    return (
        <main className="flex-1 overflow-y-auto bg-white">
            <div className="max-w-5xl mx-auto px-10 py-10">
                <div className="flex flex-col gap-3 animate-pulse">
                    {blockHeights.map((height, index) => (
                        <div
                            key={index}
                            className="border border-[#E8E8E8] rounded-xl bg-white p-6"
                            style={{ height }}
                        >
                            <div className="flex items-start justify-between mb-5">
                                <div className="space-y-3 flex-1">
                                    <div className="h-6 w-56 rounded bg-[#F0F0F0]" />
                                    <div className="h-4 w-32 rounded bg-[#F5F5F5]" />
                                </div>

                                <div className="flex gap-2">
                                    <div className="h-8 w-8 rounded-lg bg-[#F0F0F0]" />
                                    <div className="h-8 w-8 rounded-lg bg-[#F0F0F0]" />
                                </div>
                            </div>

                            <div className="space-y-3">
                                {Array.from({
                                    length: Math.max(
                                        2,
                                        Math.floor((height - 90) / 28),
                                    ),
                                }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="h-4 rounded bg-[#F0F0F0]"
                                        style={{
                                            width: `${100 - (i % 4) * 10}%`,
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-4 flex items-center justify-center py-4 border border-dashed border-[#E8E8E8] rounded-xl">
                    <div className="h-4 w-56 rounded bg-[#F0F0F0] animate-pulse" />
                </div>
            </div>
        </main>
    );
}

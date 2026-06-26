export function NoteCardSkeleton() {
    return (
        <div className="flex flex-col rounded-xl border border-[#e8e5e0] bg-white p-5 animate-pulse">
            {/* Favorite */}
            <div className="ml-auto h-7 w-7 rounded-lg bg-gray-200" />

            {/* Title */}
            <div className="mt-2 h-5 w-2/3 rounded bg-gray-200" />

            {/* Description */}
            <div className="mt-3 space-y-2">
                <div className="h-4 w-full rounded bg-gray-200" />
                <div className="h-4 w-5/6 rounded bg-gray-200" />
            </div>

            {/* Footer */}
            <div className="mt-5 flex items-center justify-between">
                <div className="space-y-2">
                    <div className="h-3 w-20 rounded bg-gray-200" />
                    <div className="h-3 w-28 rounded bg-gray-100" />
                </div>

                <div className="h-8 w-20 rounded-md bg-gray-200" />
            </div>

            {/* Author */}
            <div className="mt-4 flex items-center gap-3 border-t border-gray-100 pt-4">
                <div className="h-8 w-8 rounded-full bg-gray-200" />

                <div className="flex-1 space-y-2">
                    <div className="h-3 w-28 rounded bg-gray-200" />
                    <div className="h-3 w-20 rounded bg-gray-100" />
                </div>
            </div>
        </div>
    );
}
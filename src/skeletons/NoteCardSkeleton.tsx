export function NoteCardSkeleton() {
    return (
        <div className="flex animate-pulse flex-col rounded-xl border border-hairline bg-surface p-4">
            {/* Icon + actions row */}
            <div className="mb-2 flex items-start justify-between">
                <div className="h-9 w-9 rounded-lg bg-paper" />
                <div className="h-8 w-16 rounded-lg bg-paper" />
            </div>

            {/* Title */}
            <div className="h-4 w-2/3 rounded bg-paper" />

            {/* Description */}
            <div className="mt-2 space-y-2">
                <div className="h-3 w-full rounded bg-paper" />
                <div className="h-3 w-5/6 rounded bg-paper" />
            </div>

            {/* Footer */}
            <div className="mt-4 flex items-center justify-between border-t border-hairline pt-3">
                <div className="h-3 w-16 rounded bg-paper" />
                <div className="h-4 w-20 rounded-full bg-paper" />
            </div>
        </div>
    );
}

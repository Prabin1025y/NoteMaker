export function NoteCardSkeleton() {
    return (
        <div className="flex animate-pulse flex-col rounded-xl border border-muted bg-card/80 p-4">
            {/* Icon + actions row */}
            <div className="mb-2 flex items-start justify-between">
                <div className="h-9 w-9 rounded-lg bg-background/80" />
                <div className="h-8 w-16 rounded-lg bg-background/80" />
            </div>

            {/* Title */}
            <div className="h-4 w-2/3 rounded bg-background/80" />

            {/* Description */}
            <div className="mt-2 space-y-2">
                <div className="h-3 w-full rounded bg-background/80" />
                <div className="h-3 w-5/6 rounded bg-background/80" />
            </div>

            {/* Footer */}
            <div className="mt-4 flex items-center justify-between border-t border-muted pt-3">
                <div className="h-3 w-16 rounded bg-background/80" />
                <div className="h-4 w-20 rounded-full bg-background/80" />
            </div>
        </div>
    );
}

export default function SidebarNoteSkeleton() {
    return (
        <li>
            <div className="flex animate-pulse items-center gap-2.5 rounded-lg px-2.5 py-2">
                {/* Color dot */}
                <div className="h-2.5 w-2.5 shrink-0 rounded-full bg-strong" />

                {/* Label */}
                <div className="h-3.5 w-3/4 rounded bg-surface" />
            </div>
        </li>
    );
}

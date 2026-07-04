export default function SidebarNoteSkeleton() {
    return (
        <li>
            <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-[9px] animate-pulse">
                {/* Icon */}
                <div className="h-7 w-7 rounded-[7px] bg-gray-200 shrink-0" />

                {/* Text */}
                <div className="flex-1 min-w-0 space-y-2">
                    <div className="h-3.5 w-3/4 rounded bg-gray-200" />
                    <div className="h-3 w-12 rounded bg-gray-100" />
                </div>
            </div>
        </li>
    );
}
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import React from "react";

interface BlockActionButtonProps {
    onClick?: () => void;
    children: React.ReactNode;
    icon: React.ReactNode;
    className?: string;
}

const BlockActionButton: React.FC<BlockActionButtonProps> = ({
    onClick,
    icon,
    children,
    className,
}) => {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <button
                    className={`${className} px-3 py-2 group/button block h-full bg-card text-muted-foreground gap-2 cursor-pointer transition-colors duration-150`}
                    onClick={onClick}
                >
                    {icon}
                </button>
            </TooltipTrigger>
            <TooltipContent>
                <p>{children}</p>
            </TooltipContent>
        </Tooltip>
    );
};

export default BlockActionButton;

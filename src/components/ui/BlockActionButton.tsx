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
                    className={`${className} px-3 py-2 group/button block h-full border-r gap-2 bg-white cursor-pointer`}
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

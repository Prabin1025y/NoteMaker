export function scrollToBlock(blockId: string) {
    document.getElementById(`block-${blockId}`)?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
            ? "instant"
            : "smooth",
        block: "center",
    });
}

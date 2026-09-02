import { ColorOptionType } from "./ColorsInfo";

interface DesignType {
    id: number;
    applyDesign: (
        title: string,
        primaryColorHex: string,
        secondaryColorHex: string,
        titleColor: string,
        titleClassName?: string,
    ) => React.ReactNode;
    exampleDesign: (colorOption: ColorOptionType) => React.ReactNode;
}

export const allBlockDesigns: DesignType[] = [
    {
        id: 1,
        applyDesign: (
            title: string,
            primaryColorHex: string,
            secondaryColorHex: string,
            titleColor: string,
            titleClassName?: string,
        ) => (
            <div
                className={`
                    absolute -top-2 left-5
                    inline-flex items-center
                    h-9
                    text-xs font-semibold
                     tracking-[0.18em]
                    ${titleClassName}
                `}
            >
                <div>
                    <div
                        style={
                            {
                                "--f": "0.4em",
                                background: `
                                    radial-gradient(50% 100% at bottom, #0005 98%, #0000 101%) left top / calc(2 * var(--f)) var(--f) no-repeat border-box,
                                    radial-gradient(50% 100% at bottom, #0005 98%, #0000 101%) right top / calc(2 * var(--f)) var(--f) no-repeat border-box,
                                    linear-gradient(
                                    90deg,
                                    ${secondaryColorHex} 0%,
                                    ${primaryColorHex} 50%,
                                    ${secondaryColorHex} 100%
                                    ) no-repeat
                                `,
                                backgroundColor: primaryColorHex,
                                color: titleColor,
                            } as React.CSSProperties & Record<"--f", string>
                        }
                        className="ribbon px-5 py-2 "
                    >
                        {title}
                    </div>
                </div>
            </div>
        ),
        exampleDesign: (colorOption) => (
            <div
                className={`
                    inline-flex items-center
                    h-9
                    text-xs font-semibold
                     tracking-[0.18em]
                    text-white
                `}
            >
                <div>
                    <div
                        style={
                            {
                                "--f": "0.4em",
                                background: `
                                    radial-gradient(50% 100% at bottom, #0005 98%, #0000 101%) left top / calc(2 * var(--f)) var(--f) no-repeat border-box,
                                    radial-gradient(50% 100% at bottom, #0005 98%, #0000 101%) right top / calc(2 * var(--f)) var(--f) no-repeat border-box,
                                    linear-gradient(
                                    90deg,
                                    ${colorOption.secondaryColorHex} 0%,
                                    ${colorOption.primaryColorHex} 50%,
                                    ${colorOption.secondaryColorHex} 100%
                                    )
                                `,
                                backgroundColor: colorOption.primaryColorHex,
                                color: colorOption.titleColorHex,
                            } as React.CSSProperties & Record<"--f", string>
                        }
                        className="ribbon px-5 py-2 "
                    >
                        Title Here
                    </div>
                </div>
            </div>
        ),
    },
    {
        id: 2,
        applyDesign: (
            title: string,
            primaryColorHex: string,
            _secondaryColorHex: string,
            titleColor: string,
            titleClassName?: string,
        ) => (
            <div
                className={`
                    absolute top-0 left-10
                    inline-flex items-center
                    h-9
                    text-xs font-semibold
                     tracking-[0.18em]
                    ${titleClassName}
                `}
            >
                <div
                    style={{ borderColor: primaryColorHex }}
                    className={`bg-background relative border-2 rounded-sm -translate-y-1/2 text-foreground px-5 py-2 `}
                >
                    {title}
                    <div
                        style={{ backgroundColor: primaryColorHex }}
                        className={`size-2  rounded-full absolute left-0 top-1/2 -translate-x-full -translate-y-1/2`}
                    />
                    <div
                        style={{ backgroundColor: primaryColorHex }}
                        className={`size-2  rounded-full absolute right-0 top-1/2 translate-x-full -translate-y-1/2`}
                    />
                </div>
            </div>
        ),
        exampleDesign: (colorOption) => (
            <div
                className={`
                    inline-flex items-center
                    h-9
                    text-xs font-semibold
                     tracking-[0.18em]
                    ${"text-white"}
                `}
            >
                <div
                    style={{
                        borderColor: colorOption.primaryColorHex,
                    }}
                    className={`bg-white relative border-2 rounded-sm text-black px-5 py-2 `}
                >
                    Title Here
                    <div
                        style={{ backgroundColor: colorOption.primaryColorHex }}
                        className={`size-2  rounded-full absolute left-0 top-1/2 -translate-x-full -translate-y-1/2`}
                    />
                    <div
                        style={{ backgroundColor: colorOption.primaryColorHex }}
                        className={`size-2  rounded-full absolute right-0 top-1/2 translate-x-full -translate-y-1/2`}
                    />
                </div>
            </div>
        ),
    },
    {
        id: 3,
        applyDesign: (
            title: string,
            primaryColorHex: string,
            secondaryColorHex: string,
            titleColor: string,
            titleClassName?: string,
        ) => (
            <div
                className={`
                    absolute top-2 -left-2
                    inline-flex items-center
                    h-9
                    text-xs font-semibold
                     tracking-[0.18em]
                    ${titleClassName}
                `}
            >
                <div>
                    <div
                        style={
                            {
                                "--c": secondaryColorHex,
                                background: `radial-gradient(100% 50% at left, ${secondaryColorHex} 98%, #0000 101%) 100% 0/0.5lh calc(100% - 2 * var(--r)) no-repeat,
                                            radial-gradient(100% 50% at right, #0005 98%, #0000 101%) 0 100% / var(--r) calc(2 * var(--r)) no-repeat,
                                            linear-gradient(to right, ${secondaryColorHex} 0%, ${primaryColorHex} 50%, ${secondaryColorHex} 100%) 0 0 / calc(101% - 0.5lh) 100% no-repeat`,
                                color: titleColor,
                            } as React.CSSProperties & Record<"--c", string>
                        }
                        className="ribbon1 relative w-fit px-5 pb-3 pt-2 flex items-center justify-center "
                    >
                        {title}
                    </div>
                </div>
            </div>
        ),
        exampleDesign: (colorOption) => (
            <div
                className={`
                    inline-flex items-center
                    h-9
                    text-xs font-semibold
                     tracking-[0.18em]
                `}
            >
                <div>
                    <div
                        style={{
                            background: `radial-gradient(100% 50% at left, ${colorOption.secondaryColorHex} 98%, #0000 101%) 100% 0/0.5lh calc(100% - 2 * var(--r)) no-repeat,
                                            radial-gradient(100% 50% at right, #0005 98%, #0000 101%) 0 100% / var(--r) calc(2 * var(--r)) no-repeat,
                                            linear-gradient(to right, ${colorOption.secondaryColorHex} 0%, ${colorOption.primaryColorHex} 50%, ${colorOption.secondaryColorHex} 100%) 0 0 / calc(101% - 0.5lh) 100% no-repeat`,
                            color: colorOption.titleColorHex,
                        }}
                        className="ribbon1 px-5 pb-3 pt-2 flex items-center justify-center "
                    >
                        Title Here
                    </div>
                </div>
            </div>
        ),
    },
    {
        id: 4,
        applyDesign: (
            title: string,
            primaryColorHex: string,
            secondaryColorHex: string,
            titleColor: string,
            titleClassName?: string,
        ) => (
            <div
                className={`
                    absolute -top-2 left-5
                    inline-flex items-center
                    h-9
                    text-xs font-semibold
                    tracking-[0.18em]
                    ${titleClassName}
                `}
            >
                <div
                    style={{
                        background: `linear-gradient(90deg, ${secondaryColorHex} 0%, ${primaryColorHex} 100%)`,
                        color: titleColor,
                        clipPath:
                            "polygon(0 0, calc(100% - 0.7em) 0, 100% 50%, calc(100% - 0.7em) 100%, 0 100%)",
                    }}
                    className="pl-5 pr-8 py-2"
                >
                    {title}
                </div>
            </div>
        ),
        exampleDesign: (colorOption) => (
            <div
                className={`
                    inline-flex items-center
                    h-9
                    text-xs font-semibold
                    tracking-[0.18em]
                `}
            >
                <div
                    style={{
                        background: `linear-gradient(90deg, ${colorOption.secondaryColorHex} 0%, ${colorOption.primaryColorHex} 100%)`,
                        color: colorOption.titleColorHex,
                        clipPath:
                            "polygon(0 0, calc(100% - 0.7em) 0, 100% 50%, calc(100% - 0.7em) 100%, 0 100%)",
                    }}
                    className="pl-5 pr-8 py-2"
                >
                    Title Here
                </div>
            </div>
        ),
    },
    {
        id: 5,
        applyDesign: (
            title: string,
            primaryColorHex: string,
            secondaryColorHex: string,
            titleColor: string,
            titleClassName?: string,
        ) => (
            <div
                className={`
                    absolute -top-2 left-1/2 -translate-x-1/2
                    inline-flex items-center
                    h-9
                    text-xs font-semibold
                    tracking-[0.18em]
                    ${titleClassName}
                `}
            >
                <div
                    style={{
                        background: `linear-gradient(90deg, ${secondaryColorHex} 0%, ${primaryColorHex} 50%, ${secondaryColorHex} 100%)`,
                        color: titleColor,
                        clipPath:
                            "polygon(0 0, 100% 0, calc(100% - 0.7em) 50%, 100% 100%, 0 100%, 0.7em 50%)",
                    }}
                    className="px-9 py-2"
                >
                    {title}
                </div>
            </div>
        ),
        exampleDesign: (colorOption) => (
            <div
                className={`
                    inline-flex items-center
                    h-9
                    text-xs font-semibold
                    tracking-[0.18em]
                `}
            >
                <div
                    style={{
                        background: `linear-gradient(90deg, ${colorOption.secondaryColorHex} 0%, ${colorOption.primaryColorHex} 50%, ${colorOption.secondaryColorHex} 100%)`,
                        color: colorOption.titleColorHex,
                        clipPath:
                            "polygon(0 0, 100% 0, calc(100% - 0.7em) 50%, 100% 100%, 0 100%, 0.7em 50%)",
                    }}
                    className="px-9 py-2"
                >
                    Title Here
                </div>
            </div>
        ),
    },
    {
        id: 6,
        applyDesign: (
            title: string,
            primaryColorHex: string,
            secondaryColorHex: string,
            titleColor: string,
            titleClassName?: string,
        ) => (
            <div
                className={`
                    absolute -top-2 left-4
                    inline-flex items-center
                    h-9
                    text-xs font-semibold
                    tracking-[0.18em]
                    ${titleClassName}
                `}
            >
                <div
                    style={{
                        background: `linear-gradient(90deg, ${primaryColorHex} 0%, ${secondaryColorHex} 100%)`,
                        color: titleColor,
                        clipPath:
                            "polygon(0.8em 0, 100% 0, 100% 100%, 0.8em 100%, 0 50%)",
                    }}
                    className="relative pl-8 pr-5 py-2"
                >
                    <span className="absolute left-2 top-1/2 size-1.5 -translate-y-1/2 rounded-full bg-background" />
                    {title}
                </div>
            </div>
        ),
        exampleDesign: (colorOption) => (
            <div
                className={`
                    inline-flex items-center
                    h-9
                    text-xs font-semibold
                    tracking-[0.18em]
                `}
            >
                <div
                    style={{
                        background: `linear-gradient(90deg, ${colorOption.primaryColorHex} 0%, ${colorOption.secondaryColorHex} 100%)`,
                        color: colorOption.titleColorHex,
                        clipPath:
                            "polygon(0.8em 0, 100% 0, 100% 100%, 0.8em 100%, 0 50%)",
                    }}
                    className="relative pl-8 pr-5 py-2"
                >
                    <span className="absolute left-2 top-1/2 size-1.5 -translate-y-1/2 rounded-full bg-background" />
                    Title Here
                </div>
            </div>
        ),
    },
    {
        id: 7,
        applyDesign: (
            title: string,
            primaryColorHex: string,
            secondaryColorHex: string,
            titleColor: string,
            titleClassName?: string,
        ) => (
            <div
                className={`
                    absolute -top-3 left-6
                    inline-flex items-center
                    h-9
                    text-xs font-semibold
                    tracking-[0.18em]
                    ${titleClassName}
                `}
            >
                <div
                    style={{
                        backgroundColor: primaryColorHex,
                        color: titleColor,
                        boxShadow: `0 4px 0 0 ${secondaryColorHex}`,
                    }}
                    className="rounded-md px-5 py-2"
                >
                    {title}
                </div>
            </div>
        ),
        exampleDesign: (colorOption) => (
            <div
                className={`
                    inline-flex items-center
                    h-9
                    text-xs font-semibold
                    tracking-[0.18em]
                    mb-1
                `}
            >
                <div
                    style={{
                        backgroundColor: colorOption.primaryColorHex,
                        color: colorOption.titleColorHex,
                        boxShadow: `0 4px 0 0 ${colorOption.secondaryColorHex}`,
                    }}
                    className="rounded-md px-5 py-2"
                >
                    Title Here
                </div>
            </div>
        ),
    },
    {
        id: 8,
        applyDesign: (
            title: string,
            primaryColorHex: string,
            secondaryColorHex: string,
            titleColor: string,
            titleClassName?: string,
        ) => (
            <div
                className={`
                    absolute -top-2 left-6
                    inline-flex items-center
                    h-9
                    text-xs font-semibold
                    tracking-[0.18em]
                    ${titleClassName}
                `}
            >
                <div className="relative">
                    <div
                        className="absolute inset-0 translate-x-1.5 translate-y-1.5 rounded-sm border-2"
                        style={{ borderColor: secondaryColorHex }}
                    />
                    <div
                        className="relative rounded-sm px-5 py-2"
                        style={{
                            backgroundColor: primaryColorHex,
                            color: titleColor,
                        }}
                    >
                        {title}
                    </div>
                </div>
            </div>
        ),
        exampleDesign: (colorOption) => (
            <div
                className={`
                    inline-flex items-center
                    h-9
                    text-xs font-semibold
                    tracking-[0.18em]
                    mb-1 mr-1
                `}
            >
                <div className="relative">
                    <div
                        className="absolute inset-0 translate-x-1.5 translate-y-1.5 rounded-sm border-2"
                        style={{ borderColor: colorOption.secondaryColorHex }}
                    />
                    <div
                        className="relative rounded-sm px-5 py-2"
                        style={{
                            backgroundColor: colorOption.primaryColorHex,
                            color: colorOption.titleColorHex,
                        }}
                    >
                        Title Here
                    </div>
                </div>
            </div>
        ),
    },
    {
        id: 9,
        applyDesign: (
            title: string,
            primaryColorHex: string,
            _secondaryColorHex: string,
            _titleColor: string,
            titleClassName?: string,
        ) => (
            <div
                className={`
                    absolute -top-2 left-5
                    inline-flex items-stretch
                    h-9
                    text-xs font-semibold
                    tracking-[0.18em]
                    ${titleClassName}
                `}
            >
                <div
                    className="w-1.5 rounded-l-sm"
                    style={{ backgroundColor: primaryColorHex }}
                />
                <div
                    className="flex items-center rounded-r-sm border-y-2 border-r-2 px-4 text-foreground"
                    style={{
                        borderColor: primaryColorHex,
                        backgroundColor: `${primaryColorHex}20`,
                    }}
                >
                    {title}
                </div>
            </div>
        ),
        exampleDesign: (colorOption) => (
            <div
                className={`
                    inline-flex items-stretch
                    h-9
                    text-xs font-semibold
                    tracking-[0.18em]
                `}
            >
                <div
                    className="w-1.5 rounded-l-sm"
                    style={{ backgroundColor: colorOption.primaryColorHex }}
                />
                <div
                    className="flex items-center rounded-r-sm border-y-2 border-r-2 px-4 text-foreground"
                    style={{
                        borderColor: colorOption.primaryColorHex,
                        backgroundColor: `${colorOption.primaryColorHex}20`,
                    }}
                >
                    Title Here
                </div>
            </div>
        ),
    },
    {
        id: 10,
        applyDesign: (
            title: string,
            primaryColorHex: string,
            _secondaryColorHex: string,
            _titleColor: string,
            titleClassName?: string,
        ) => (
            <div
                className={`
                    absolute -top-2 left-6
                    inline-flex items-center
                    h-9
                    text-xs font-semibold
                    tracking-[0.18em]
                    ${titleClassName}
                `}
            >
                <div className="relative bg-background px-4 py-2 text-foreground">
                    {title}
                    <span
                        className="absolute left-0 top-0 size-2 border-l-2 border-t-2"
                        style={{ borderColor: primaryColorHex }}
                    />
                    <span
                        className="absolute right-0 top-0 size-2 border-r-2 border-t-2"
                        style={{ borderColor: primaryColorHex }}
                    />
                    <span
                        className="absolute bottom-0 left-0 size-2 border-b-2 border-l-2"
                        style={{ borderColor: primaryColorHex }}
                    />
                    <span
                        className="absolute bottom-0 right-0 size-2 border-b-2 border-r-2"
                        style={{ borderColor: primaryColorHex }}
                    />
                </div>
            </div>
        ),
        exampleDesign: (colorOption) => (
            <div
                className={`
                    inline-flex items-center
                    h-9
                    text-xs font-semibold
                    tracking-[0.18em]
                `}
            >
                <div className="relative bg-background px-4 py-2 text-foreground">
                    Title Here
                    <span
                        className="absolute left-0 top-0 size-2 border-l-2 border-t-2"
                        style={{ borderColor: colorOption.primaryColorHex }}
                    />
                    <span
                        className="absolute right-0 top-0 size-2 border-r-2 border-t-2"
                        style={{ borderColor: colorOption.primaryColorHex }}
                    />
                    <span
                        className="absolute bottom-0 left-0 size-2 border-b-2 border-l-2"
                        style={{ borderColor: colorOption.primaryColorHex }}
                    />
                    <span
                        className="absolute bottom-0 right-0 size-2 border-b-2 border-r-2"
                        style={{ borderColor: colorOption.primaryColorHex }}
                    />
                </div>
            </div>
        ),
    },
    {
        id: 11,
        applyDesign: (
            title: string,
            primaryColorHex: string,
            secondaryColorHex: string,
            titleColor: string,
            titleClassName?: string,
        ) => (
            <div
                className={`
                    absolute -top-2 left-6
                    inline-flex items-center
                    h-9
                    text-xs font-semibold
                    tracking-[0.18em]
                    ${titleClassName}
                `}
            >
                <div
                    className="relative rounded-sm py-2 pl-5 pr-7"
                    style={{
                        backgroundColor: primaryColorHex,
                        color: titleColor,
                    }}
                >
                    {title}
                    <span
                        className="absolute right-0 top-0 size-3"
                        style={{
                            backgroundColor: secondaryColorHex,
                            clipPath: "polygon(0 0, 100% 0, 100% 100%)",
                        }}
                    />
                </div>
            </div>
        ),
        exampleDesign: (colorOption) => (
            <div
                className={`
                    inline-flex items-center
                    h-9
                    text-xs font-semibold
                    tracking-[0.18em]
                `}
            >
                <div
                    className="relative rounded-sm py-2 pl-5 pr-7"
                    style={{
                        backgroundColor: colorOption.primaryColorHex,
                        color: colorOption.titleColorHex,
                    }}
                >
                    Title Here
                    <span
                        className="absolute right-0 top-0 size-3"
                        style={{
                            backgroundColor: colorOption.secondaryColorHex,
                            clipPath: "polygon(0 0, 100% 0, 100% 100%)",
                        }}
                    />
                </div>
            </div>
        ),
    },
    {
        id: 12,
        applyDesign: (
            title: string,
            primaryColorHex: string,
            secondaryColorHex: string,
            titleColor: string,
            titleClassName?: string,
        ) => (
            <div
                className={`
                    absolute -top-3 left-1/2 -translate-x-1/2
                    inline-flex flex-col items-center
                    text-xs font-semibold
                    tracking-[0.18em]
                    ${titleClassName}
                `}
            >
                <div className="relative flex items-center justify-center">
                    <span
                        className="absolute left-2 top-[55%] z-0 h-4 w-3"
                        style={{
                            backgroundColor: secondaryColorHex,
                            clipPath:
                                "polygon(0 0, 100% 0, 100% 100%, 50% 70%, 0 100%)",
                        }}
                    />
                    <span
                        className="absolute right-2 top-[55%] z-0 h-4 w-3"
                        style={{
                            backgroundColor: secondaryColorHex,
                            clipPath:
                                "polygon(0 0, 100% 0, 100% 100%, 50% 70%, 0 100%)",
                        }}
                    />
                    <div
                        className="relative z-10 px-7 py-2"
                        style={{
                            background: `linear-gradient(90deg, ${secondaryColorHex}, ${primaryColorHex} 50%, ${secondaryColorHex})`,
                            color: titleColor,
                        }}
                    >
                        {title}
                    </div>
                </div>
            </div>
        ),
        exampleDesign: (colorOption) => (
            <div
                className={`
                    inline-flex flex-col items-center
                    text-xs font-semibold
                    tracking-[0.18em]
                `}
            >
                <div className="relative flex items-center justify-center">
                    <span
                        className="absolute left-2 top-[55%] z-0 h-4 w-3"
                        style={{
                            backgroundColor: colorOption.secondaryColorHex,
                            clipPath:
                                "polygon(0 0, 100% 0, 100% 100%, 50% 70%, 0 100%)",
                        }}
                    />
                    <span
                        className="absolute right-2 top-[55%] z-0 h-4 w-3"
                        style={{
                            backgroundColor: colorOption.secondaryColorHex,
                            clipPath:
                                "polygon(0 0, 100% 0, 100% 100%, 50% 70%, 0 100%)",
                        }}
                    />
                    <div
                        className="relative z-10 px-7 py-2"
                        style={{
                            background: `linear-gradient(90deg, ${colorOption.secondaryColorHex}, ${colorOption.primaryColorHex} 50%, ${colorOption.secondaryColorHex})`,
                            color: colorOption.titleColorHex,
                        }}
                    >
                        Title Here
                    </div>
                </div>
            </div>
        ),
    },
];

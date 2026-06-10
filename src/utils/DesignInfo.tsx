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
                    className={`bg-white relative border-2 rounded-sm -translate-y-1/2 text-black px-5 py-2 `}
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
];

export interface ColorOptionType {
    id: number;
    name: string;
    primaryColorHex: string;
    secondaryColorHex: string;
    borderColorHex: string;
    backgroundColorHex: string;
    titleColorHex: string;
    contentColorHex: string;
}

export const colorOptions: ColorOptionType[] = [
    {
        id: 1,
        name: "Red",
        primaryColorHex: "#ce0000",
        secondaryColorHex: "#970000",
        borderColorHex: "#B91C1C",
        backgroundColorHex: "#FEF2F2",
        titleColorHex: "#ffffff",
        contentColorHex: "#000000",
    },
    {
        id: 2,
        name: "Blue",
        primaryColorHex: "#008ad4",
        secondaryColorHex: "#004080",
        borderColorHex: "#0069A8",
        backgroundColorHex: "#F0F9FF",
        titleColorHex: "#FFFFFF",
        contentColorHex: "#000000",
    },
    {
        id: 3,
        name: "Green",
        primaryColorHex: "#4eba00",
        secondaryColorHex: "#468100",
        borderColorHex: "#047857",
        backgroundColorHex: "#ECFDF5",
        titleColorHex: "#ffffff",
        contentColorHex: "#000000",
    },
    {
        id: 4,
        name: "Yellow",
        primaryColorHex: "#CFA600",
        secondaryColorHex: "#AF8C00",
        borderColorHex: "#EBC83C",
        backgroundColorHex: "#FFFBEB",
        titleColorHex: "#ffffff",
        contentColorHex: "#000000",
    },
];

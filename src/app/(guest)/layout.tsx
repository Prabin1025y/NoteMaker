import GuestGate from "@/components/GuestGate";

export default function GuestLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <GuestGate>{children}</GuestGate>;
}
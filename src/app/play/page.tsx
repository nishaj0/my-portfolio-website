import type { Metadata } from "next";
import KiteCircuit from "../../components/KiteCircuit";

export const metadata: Metadata = {
  title: "Kite Circuit",
  description: "Play Kite Circuit, an endless monochrome aerial gate-run game by Nishaj M.",
  robots: { index: false, follow: true },
};

export default function PlayPage() {
  return <KiteCircuit />;
}

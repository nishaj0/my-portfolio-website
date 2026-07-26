import type { Metadata } from "next";
import KiteCircuit from "../../components/KiteCircuit";

export const metadata: Metadata = {
  title: "Paper Plane Run — In Development",
  description: "Play Paper Plane Run, an endless monochrome aerial gate-run game by Nishaj M.",
  robots: { index: false, follow: false },
};

export default function PlayPage() {
  return <KiteCircuit />;
}

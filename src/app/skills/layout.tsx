import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Skills",
  description: "all skills by Nishaj M (nishaj0) ",
  openGraph: {
    title: "Skills - Nishaj M Portfolio",
    description: "Explore all skills by Nishaj M showcasing web development expertise",
    url: "https://nishaj.me/skills",
  },
  twitter: {
    title: "Skills - Nishaj M Portfolio",
    description: "Explore all skills by Nishaj M showcasing web development expertise",
  },
};

export default function SkillsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

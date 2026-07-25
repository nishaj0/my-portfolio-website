import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Skills",
  description: "Explore Nishaj M's full-stack development skills across languages, frameworks, databases, cloud platforms, and AI tools.",
  alternates: { canonical: "/skills" },
  openGraph: {
    title: "Skills",
    description: "Explore Nishaj M's full-stack development skills across languages, frameworks, databases, cloud platforms, and AI tools.",
    url: "/skills",
  },
  twitter: {
    title: "Skills",
    description: "Explore Nishaj M's full-stack development skills across languages, frameworks, databases, cloud platforms, and AI tools.",
  },
};

export default function SkillsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

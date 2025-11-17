import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projects",
  description: "Explore all projects by Muhammed Nishaj M (nishaj0) - A comprehensive collection of web development projects showcasing skills in React, Next.js, and modern web technologies.",
  openGraph: {
    title: "Projects - Nishaj M Portfolio",
    description: "Explore all projects by Muhammed Nishaj M showcasing web development expertise",
    url: "https://nishaj.me/projects",
  },
  twitter: {
    title: "Projects - Nishaj M Portfolio",
    description: "Explore all projects by Muhammed Nishaj M showcasing web development expertise",
  },
};

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

import type { Metadata } from "next";
import "../index.css";
import { Header, CustomCursor } from "../components";

export const metadata: Metadata = {
  title: {
    default: "Nishaj M - Full Stack Developer & Designer Portfolio",
    template: "%s | Nishaj M",
  },
  description: "Nishaj M is a full-stack software developer and designer building web applications, automation, and interactive experiences.",
  applicationName: "Nishaj M Portfolio",
  category: "portfolio",
  referrer: "origin-when-cross-origin",
  keywords: [
    "nishaj0",
    "Nishaj M",
    "Muhammed Nishaj M",
    "Full Stack Developer",
    "Web Developer",
    "Portfolio",
    "React Developer",
    "Next.js Developer",
    "Frontend Developer",
    "Backend Developer",
    "Software Engineer",
    "Web Design",
    "UI/UX Developer"
  ],
  authors: [{ name: "Nishaj M", url: "https://github.com/nishaj0" }],
  creator: "Nishaj M",
  publisher: "Nishaj M",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://nishaj.me"),
  openGraph: {
    title: "Nishaj M - Full Stack Developer & Designer Portfolio",
    description: "A portfolio of full-stack projects, skills, and experiments by Nishaj M.",
    url: "/",
    siteName: "Nishaj M Portfolio",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nishaj M - Full Stack Developer & Designer Portfolio",
    description: "A portfolio of full-stack projects, skills, and experiments by Nishaj M.",
    creator: "@nishaj0",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": "https://nishaj.me/#person",
        name: "Nishaj M",
        alternateName: ["Muhammed Nishaj M", "nishaj0"],
        url: "https://nishaj.me",
        email: "njnishaj0@gmail.com",
        jobTitle: "Full Stack Developer",
        description: "Full-stack software developer and designer building web applications, automation, and interactive experiences.",
        sameAs: [
          "https://github.com/nishaj0",
          "https://www.linkedin.com/in/nishaj0/",
          "https://x.com/nishaj0",
        ],
        knowsAbout: ["Web Development", "React", "Next.js", "JavaScript", "TypeScript", "Go", "Node.js", "PostgreSQL", "Full Stack Development"],
      },
      {
        "@type": "WebSite",
        "@id": "https://nishaj.me/#website",
        name: "Nishaj M Portfolio",
        url: "https://nishaj.me",
        description: "Portfolio of Nishaj M, a full-stack software developer and designer.",
        inLanguage: "en",
        author: { "@id": "https://nishaj.me/#person" },
      },
    ],
  };

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <div className="relative">
          <CustomCursor />
          <Header />
          {children}
          <footer className="py-8 text-center text-sm text-gray-600 border-t border-gray-200">
            <div className="container mx-auto px-6">
              <p>© 2025 nishaj. All rights reserved.</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}

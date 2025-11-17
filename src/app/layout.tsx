import type { Metadata } from "next";
import "../index.css";
import { Header, CustomCursor } from "../components";

export const metadata: Metadata = {
  title: {
    default: "Nishaj M - Full Stack Developer & Designer Portfolio",
    template: "%s | Nishaj M"
  },
  description: "Portfolio of Muhammed Nishaj M (nishaj0) - Full Stack Developer showcasing web development projects, skills, and innovative solutions. Explore my work in React, Next.js, and modern web technologies.",
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
  metadataBase: new URL("https://nishaj0.github.io/my-portfolio-website"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Nishaj M - Full Stack Developer & Designer Portfolio",
    description: "Portfolio of Muhammed Nishaj M showcasing web development projects and skills",
    url: "https://nishaj0.github.io/my-portfolio-website",
    siteName: "Nishaj M Portfolio",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Nishaj M Portfolio Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nishaj M - Full Stack Developer & Designer Portfolio",
    description: "Portfolio of Muhammed Nishaj M showcasing web development projects and skills",
    images: ["/og-image.png"],
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
  verification: {
    google: "google-site-verification-code", // User should replace with actual verification code
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Nishaj M",
    alternateName: ["Muhammed Nishaj M", "nishaj0"],
    url: "https://nishaj0.github.io/my-portfolio-website",
    jobTitle: "Full Stack Developer",
    description: "Full Stack Developer and Designer specializing in modern web technologies",
    sameAs: [
      "https://github.com/nishaj0",
    ],
    knowsAbout: [
      "Web Development",
      "React",
      "Next.js",
      "JavaScript",
      "TypeScript",
      "Frontend Development",
      "Backend Development",
      "Full Stack Development"
    ]
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

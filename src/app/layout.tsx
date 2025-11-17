import type { Metadata } from "next";
import "../index.css";
import { Header, CustomCursor } from "../components";

export const metadata: Metadata = {
  title: "my-portfolio-website",
  description: "Portfolio website showcasing my projects and skills",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
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

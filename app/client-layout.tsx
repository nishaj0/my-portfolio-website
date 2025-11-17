'use client';

import { Header, CustomCursor } from "@/src/components";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
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
  );
}

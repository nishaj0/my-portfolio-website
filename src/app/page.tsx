import type { Metadata } from "next";
import { Hero, About, Contact, Projects } from "../components";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <main>
      <Hero />
      <About />
      <Projects limit={3} />
      <Contact />
    </main>
  );
}

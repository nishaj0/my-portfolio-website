import { Hero, About, Contact, Projects } from "../components";

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

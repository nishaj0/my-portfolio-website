import { Hero, About, Contact, Projects } from "../components"

function HomePage() {
  return (
    <main>
      <Hero />
      <About />
      <Projects limit={3} />
      <Contact />
    </main>
  )
}

export default HomePage
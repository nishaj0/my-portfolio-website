import { Hero, About, Contact, Projects } from "../components"

function HomePage() {
  return (
    <main>
      <Hero />
      <About />
      <Projects /> {/* add a limit prop (maybe 3) to show only a few projects */}
      <Contact />
    </main>
  )
}

export default HomePage
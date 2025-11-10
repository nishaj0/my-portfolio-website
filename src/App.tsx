import { Hero, About, Contact, Header, Projects, CustomCursor } from "./components"
function App() {

  return (
    <div className="relative">
      <CustomCursor />
      <Header />
      <main>
        <Hero />
        <About />
        <Projects />
        <Contact />
      </main>
      <footer>
        <div>
          <p>© nishaj. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default App

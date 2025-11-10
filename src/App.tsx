import { Route, BrowserRouter as Router, Routes } from "react-router-dom"
import { Header, CustomCursor } from "./components"
import { HomePage, ProjectsPage } from "./pages"
function App() {

  return (
    <Router>
      <div className="relative">
        <CustomCursor />
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/projects" element={<ProjectsPage />} />
        </Routes>
        <footer>
          <div>
            <p>© 2025 nishaj. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </Router>
  )
}

export default App

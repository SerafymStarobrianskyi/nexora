import { Route, Routes } from "react-router-dom"
import HomePage from "./pages/homePage/HomePage"
import ProjectsPage from "./pages/projectsPage/ProjectsPage"
import SettingsPage from "./pages/settingsPage/SettingsPage"

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage/>}/>
      <Route path="/projects" element={<ProjectsPage/>}/>
      <Route path="/settings" element={<SettingsPage/>}/>
    </Routes>
  )
}

export default App

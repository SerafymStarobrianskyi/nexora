import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/homePage/HomePage";
import ProjectsPage from "./pages/projectsPage/ProjectsPage";
import SettingsPage from "./pages/settingsPage/SettingsPage";
import LoginPage from "./pages/authPage/loginPage/LoginPage";
import RegisterPage from "./pages/authPage/registerPage/RegisterPage";
import ProtectedRoute from "./components/ProtectedRoute.tsx/ProtectedRoute";

function App() {
  return (
    <Routes>
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
    </Routes>
  );
}

export default App;

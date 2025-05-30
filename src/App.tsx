import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import TeamList from "./pages/team/TeamList";
import TeamForm from "./pages/team/TeamForm";
import ProjectList from "./pages/project/ProjectList";
import ProjectForm from "./pages/project/ProjectForm";
import TaskList from "./pages/task/TaskList";
import TaskForm from "./pages/task/TaskForm";
import Settings from "./pages/Settings";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import NotFound from "./pages/NotFound";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />

        <Route path="teams">
          <Route index element={<TeamList />} />
          <Route path="new" element={<TeamForm />} />
          <Route path=":id/edit" element={<TeamForm />} />
        </Route>

        <Route path="projects">
          <Route index element={<ProjectList />} />
          <Route path="new" element={<ProjectForm />} />
          <Route path=":id/edit" element={<ProjectForm />} />
        </Route>

        <Route path="tasks">
          <Route index element={<TaskList />} />
          <Route path="new" element={<TaskForm />} />
          <Route path=":id/edit" element={<TaskForm />} />
        </Route>

        <Route path="settings" element={<Settings />} />

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;

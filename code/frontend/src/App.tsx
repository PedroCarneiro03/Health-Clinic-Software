import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/side-bar/app-sidebar";

import Home from './pages/home/home';
import Login from './pages/login/login';
import Register from './pages/register/register';
import SettingsPage from './pages/settings/settings';

import { PLanoIndividual } from './pages/plano-individual/planoInidividual';
import { PLanoIndividualExame } from './pages/plano-individual-exames/planoInidividualExame';
import { PLanoIndividualReceita } from './pages/plano-individual-receitas/planoInidividualReceita';

import Notifications from './pages/notifications/notifications';
import Calendario from './pages/Calendario';
import Consultas from './pages/consultas/Consultas';

import { PopupPage } from './pages/popupPage/popupPage';
import { PopupExamPage } from './pages/popupPage/exampopupPage';

import { JSX, useEffect } from "react";
import { UserProfilePage } from './pages/userProfilePage/userProfilePage';

export function ProtectedRoute({ children }: { children: JSX.Element }) {
  const location = useLocation()
  const token = sessionStorage.getItem("authToken")

  // Se não tiver token e não está nas rotas públicas, redireciona
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

export function ProtectedDoctorRoute({ children }: { children: JSX.Element }) {
  const location = useLocation()
  const role =  sessionStorage.getItem("role")
  const id =  sessionStorage.getItem("id")



  // Se não tiver token e não está nas rotas públicas, redireciona
  if (role !== "DOCTOR") {
    return <Navigate to={`/plan/${id}`} state={{ from: location }} replace />
  }

  return children
}


const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();

  // Define routes where sidebar should be hidden
  const hideSidebar = ["/login", "/register"].includes(location.pathname);
  if (hideSidebar)
  {
    return (<>{children}</>)

  }


  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarTrigger />
      <main className="w-full flex-1 p-20 overflow-y-auto">
        {children}
      </main>
    </SidebarProvider>
  );
};

const App = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* Rotas públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Rotas protegidas */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <ProtectedDoctorRoute>
                <Home />
                </ProtectedDoctorRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/calendario"
            element={
              <ProtectedRoute>
                <ProtectedDoctorRoute>
                <Calendario />
                </ProtectedDoctorRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/consultas"
            element={
              <ProtectedRoute>
                <Consultas />
              </ProtectedRoute>
            }
          />
          <Route
            path="/definicoes"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/plan/:id"
            element={
              <ProtectedRoute>
                <PLanoIndividual />
              </ProtectedRoute>
            }
          />
          <Route
            path="/plan/:id/exams"
            element={
              <ProtectedRoute>
                <PLanoIndividualExame />
              </ProtectedRoute>
            }
          />
          <Route
            path="/plan/:id/prescriptions"
            element={
              <ProtectedRoute>
                <PLanoIndividualReceita />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <UserProfilePage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App;

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { MainLayout } from "./components/Layout/MainLayout";
import { DashboardLayout } from "./components/Layout/DashboardLayout";

// Pages
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import Notes from "./pages/Notes";
import QnA from "./pages/QnA";
import Schedule from "./pages/Schedule";
import Study from "./pages/Study";
import Todo from "./pages/Todo";
import Budget from "./pages/Budget";

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        state={{ from: window.location.pathname }}
        replace
      />
    );
  }

  return <>{children}</>;
};

// Public Layout Component
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  return <MainLayout>{children}</MainLayout>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              {/* Public Routes */}
              <Route
                path="/"
                element={
                  <PublicRoute>
                    <Home />
                  </PublicRoute>
                }
              />

              <Route
                path="/about"
                element={
                  <PublicRoute>
                    <About />
                  </PublicRoute>
                }
              />

              <Route
                path="/contact"
                element={
                  <PublicRoute>
                    <Contact />
                  </PublicRoute>
                }
              />

              <Route
                path="/terms"
                element={
                  <PublicRoute>
                    <Terms />
                  </PublicRoute>
                }
              />

              <Route
                path="/privacy"
                element={
                  <PublicRoute>
                    <Privacy />
                  </PublicRoute>
                }
              />

              {/* Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Routes */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <PublicRoute>
                      <Profile />
                    </PublicRoute>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <PublicRoute>
                      <Dashboard />
                    </PublicRoute>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/notes"
                element={
                  <ProtectedRoute>
                    <PublicRoute>
                      <Notes />
                    </PublicRoute>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/qna"
                element={
                  <ProtectedRoute>
                    <PublicRoute>
                      <QnA />
                    </PublicRoute>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/schedule"
                element={
                  <ProtectedRoute>
                    <PublicRoute>
                      <Schedule />
                    </PublicRoute>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/study"
                element={
                  <ProtectedRoute>
                    <PublicRoute>
                      <Study />
                    </PublicRoute>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/todo"
                element={
                  <ProtectedRoute>
                    <PublicRoute>
                      <Todo />
                    </PublicRoute>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/budget"
                element={
                  <ProtectedRoute>
                    <PublicRoute>
                      <Budget />
                    </PublicRoute>
                  </ProtectedRoute>
                }
              />

              {/* 404 - Not Found */}
              <Route
                path="*"
                element={
                  <PublicRoute>
                    <NotFound />
                  </PublicRoute>
                }
              />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

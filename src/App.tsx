import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import { AuthPage } from "./pages/Auth";
import { ProfilePage } from "./pages/Profile";
import NotFound from "./pages/NotFound";

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen w-full">
      <main className="w-full">
        {children}
      </main>
    </div>
  );
};

const App = () => {
  return (
    <>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route
            path="/"
            element={
              <AppLayout>
                <Index />
              </AppLayout>
            }
          />
          <Route
            path="/profile"
            element={
              <AppLayout>
                <ProfilePage />
              </AppLayout>
            }
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App;

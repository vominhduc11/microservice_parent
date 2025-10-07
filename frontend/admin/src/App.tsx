
import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from "@/components/ui/sonner";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

import { useAuth } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { ErrorBoundary } from "./components/ErrorBoundary";
import LoginPage from "@/pages/LoginPage";
import ResellerRegistrationPage from "@/pages/ResellerRegistrationPage";
import { Dashboard } from "./components/Dashboard";
import { ProductsPage } from "./components/ProductsPage";
import { OrdersPage } from "./components/OrdersPage";
import { CustomersPage } from "./components/CustomersPage";
import { ReportsPage } from "./components/ReportsPage";
import { BlogsPage } from "./components/BlogsPage";
import { NotificationsPage } from "./components/NotificationsPage";
import { SettingsPage } from "./components/SettingsPage";
import { AdminManagementPage } from "./components/AdminManagementPage";
import NotFound from "@/pages/NotFound";
import { Header } from "./components/Header";
import { AppSidebar } from "./components/AppSidebar";

function App() {
  const { isAuthenticated, isInitializing, user } = useAuth();

  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (isInitializing) {
      return <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Đang tải...</div>
      </div>;
    }

    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
  };

  const RoleProtectedRoute = ({ children, requiredRole }: { children: React.ReactNode, requiredRole: string }) => {
    if (isInitializing) {
      return <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Đang tải...</div>
      </div>;
    }

    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }

    if (!user?.roles?.includes(requiredRole)) {
      return <Navigate to="/" replace />;
    }

    return <>{children}</>;
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/*" element={
          <ProtectedRoute>
            <NotificationProvider>
              <SidebarProvider>
                <div className="flex min-h-screen w-full">
                  <AppSidebar />
                  <SidebarInset>
                    <Header />
                    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-muted/30 p-3 sm:p-4 md:p-6 xl:p-8 3xl:p-10">
                      <div className="max-w-none 5xl:max-w-[calc(100vw-20rem)]">
                      <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/products" element={<ProductsPage />} />
                        <Route path="/orders" element={<OrdersPage />} />
                        <Route path="/customers" element={<CustomersPage />} />
                        <Route path="/reports" element={<ReportsPage />} />
                        <Route path="/blogs" element={<BlogsPage />} />
                        <Route path="/admins" element={
                          <RoleProtectedRoute requiredRole="SYSTEM">
                            <AdminManagementPage />
                          </RoleProtectedRoute>
                        } />
                        <Route path="/notifications" element={<NotificationsPage />} />
                        <Route path="/settings" element={<SettingsPage />} />
                      </Routes>
                      </div>
                    </main>
                  </SidebarInset>
                </div>
              </SidebarProvider>
            </NotificationProvider>
          </ProtectedRoute>
        } />
        <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </div>
    </ErrorBoundary>
  );
}

export default App;

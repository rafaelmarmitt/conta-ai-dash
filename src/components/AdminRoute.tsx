import { Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import mascot from "@/assets/mascot.png";

export function AdminRoute({ children }: { children: JSX.Element }) {
  return (
    <ProtectedRoute>
      <AdminGate>{children}</AdminGate>
    </ProtectedRoute>
  );
}

function AdminGate({ children }: { children: JSX.Element }) {
  const { isAdmin, loading } = useIsAdmin();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
        <img src={mascot} alt="" className="h-20 w-20 animate-float" />
        <p className="text-sm text-muted-foreground">Verificando permissões...</p>
      </div>
    );
  }

  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
}

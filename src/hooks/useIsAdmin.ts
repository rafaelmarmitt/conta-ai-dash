import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useIsAdmin() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    if (!user) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }
    (async () => {
      const { data } = await supabase.rpc("is_current_user_admin");
      if (mounted) {
        setIsAdmin(data === true);
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [user]);

  return { isAdmin, loading };
}

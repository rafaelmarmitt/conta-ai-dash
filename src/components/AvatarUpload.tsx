import { useRef, useState } from "react";
import { Camera, Loader2, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface AvatarUploadProps {
  size?: number;
  fallbackInitial?: string;
  className?: string;
}

const MAX_BYTES = 2 * 1024 * 1024; // 2MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export function AvatarUpload({ size = 128, fallbackInitial = "?", className = "" }: AvatarUploadProps) {
  const { user, profile, refreshProfile } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File) => {
    if (!user) return;
    if (!ALLOWED.includes(file.type)) {
      toast.error("Formato inválido. Use JPG, PNG, WebP ou GIF.");
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error("Imagem muito grande. O limite é 2MB.");
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${user.id}/avatar-${Date.now()}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true, contentType: file.type });
      if (upErr) throw upErr;

      const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
      const publicUrl = pub.publicUrl;

      // Remove previous avatar files (optional cleanup)
      if (profile?.avatar_url) {
        try {
          const prev = profile.avatar_url.split("/avatars/")[1];
          if (prev && prev !== path) {
            await supabase.storage.from("avatars").remove([prev]);
          }
        } catch { /* noop */ }
      }

      const { error: updErr } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("user_id", user.id);
      if (updErr) throw updErr;

      await refreshProfile();
      toast.success("Foto de perfil atualizada!");
    } catch (e: any) {
      toast.error(e?.message || "Não foi possível enviar a foto.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleRemove = async () => {
    if (!user || !profile?.avatar_url) return;
    setUploading(true);
    try {
      const prev = profile.avatar_url.split("/avatars/")[1];
      if (prev) await supabase.storage.from("avatars").remove([prev]);
      const { error } = await supabase
        .from("profiles")
        .update({ avatar_url: null })
        .eq("user_id", user.id);
      if (error) throw error;
      await refreshProfile();
      toast.success("Foto removida.");
    } catch (e: any) {
      toast.error(e?.message || "Não foi possível remover a foto.");
    } finally {
      setUploading(false);
    }
  };

  const dimension = `${size}px`;

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <div
        className="relative group cursor-pointer"
        style={{ width: dimension, height: dimension }}
        onClick={() => !uploading && inputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label="Alterar foto de perfil"
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !uploading) {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
      >
        <div className="absolute inset-0 gradient-primary rounded-full blur-xl opacity-50 group-hover:opacity-80 transition-smooth" />
        {profile?.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt="Foto de perfil"
            className="relative w-full h-full rounded-full object-cover shadow-glow border-4 border-card"
          />
        ) : (
          <div className="relative w-full h-full rounded-full gradient-primary text-primary-foreground flex items-center justify-center text-5xl font-extrabold shadow-glow">
            {fallbackInitial}
          </div>
        )}
        <div className="absolute inset-0 rounded-full bg-foreground/0 group-hover:bg-foreground/30 transition-smooth flex items-center justify-center opacity-0 group-hover:opacity-100">
          <Camera className="h-6 w-6 text-white" />
        </div>
        <div className="absolute bottom-0 right-0 h-9 w-9 rounded-full bg-card border-2 border-border flex items-center justify-center shadow-soft">
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          <Camera className="h-3.5 w-3.5" /> {profile?.avatar_url ? "Trocar foto" : "Enviar foto"}
        </Button>
        {profile?.avatar_url && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            disabled={uploading}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" /> Remover
          </Button>
        )}
      </div>
      <p className="text-[11px] text-muted-foreground">JPG, PNG ou WebP — até 2MB</p>
    </div>
  );
}

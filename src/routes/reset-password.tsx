import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/reset-password")({
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const { updatePassword } = useAuth();
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Supabase's reset link exchanges a recovery token for a session automatically
    // via the URL fragment; onAuthStateChange fires PASSWORD_RECOVERY once ready.
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }

    setSubmitting(true);
    const result = await updatePassword(password);
    setSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }
    setDone(true);
    setTimeout(() => navigate({ to: "/" }), 2000);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="font-serif text-3xl font-normal">Set a new password</h1>
          <p className="text-sm text-muted-foreground">
            {ready ? "Choose a new password for your account." : "Verifying your reset link…"}
          </p>
        </div>

        {done ? (
          <p className="text-center text-sm text-muted-foreground">
            Password updated. Redirecting you to the store…
          </p>
        ) : ready ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="password">New password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="rounded-none" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm">Confirm password</Label>
              <Input id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="rounded-none" />
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
            <Button type="submit" disabled={submitting} className="h-11 w-full rounded-none text-[11px] uppercase tracking-[0.18em]">
              {submitting ? "Updating…" : "Update password"}
            </Button>
          </form>
        ) : null}
      </div>
    </main>
  );
}

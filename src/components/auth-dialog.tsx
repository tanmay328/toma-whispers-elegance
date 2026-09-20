import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";

type Mode = "login" | "signup" | "forgot";

export function AuthDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { signIn, signUp, resetPassword } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmSent, setConfirmSent] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const reset = () => {
    setFullName("");
    setEmail("");
    setPassword("");
    setError(null);
    setConfirmSent(false);
    setResetSent(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError("Enter your email.");
      return;
    }

    if (mode === "forgot") {
      setSubmitting(true);
      const result = await resetPassword(email);
      setSubmitting(false);
      if (result.error) {
        setError(result.error);
        return;
      }
      setResetSent(true);
      return;
    }

    if (!password) {
      setError("Enter your password.");
      return;
    }
    if (mode === "signup" && !fullName) {
      setError("Enter your name.");
      return;
    }

    setSubmitting(true);
    const result =
      mode === "signup" ? await signUp(email, password, fullName) : await signIn(email, password);
    setSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    if (mode === "signup") {
      setConfirmSent(true);
    } else {
      reset();
      onOpenChange(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) reset();
      }}
    >
      <DialogContent className="sm:max-w-sm rounded-none">
        <DialogHeader>
          <DialogTitle className="font-serif text-3xl font-normal">
            {mode === "login" ? "Welcome back" : mode === "signup" ? "Create an account" : "Reset your password"}
          </DialogTitle>
          <DialogDescription>
            {mode === "login"
              ? "Sign in to view your orders and wishlist."
              : mode === "signup"
                ? "Join for a considered shopping experience."
                : "Enter your email and we'll send you a link to reset your password."}
          </DialogDescription>
        </DialogHeader>

        {confirmSent ? (
          <div className="py-4 text-sm text-muted-foreground">
            Check your inbox at <span className="text-foreground">{email}</span> to confirm your account before signing in.
          </div>
        ) : resetSent ? (
          <div className="py-4 text-sm text-muted-foreground">
            Check your inbox at <span className="text-foreground">{email}</span> for a link to reset your password.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            {mode === "signup" && (
              <div className="space-y-1.5">
                <Label htmlFor="fullName">Full name</Label>
                <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} className="rounded-none" />
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-none" />
            </div>
            {mode !== "forgot" && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  {mode === "login" && (
                    <button
                      type="button"
                      onClick={() => {
                        setMode("forgot");
                        setError(null);
                      }}
                      className="text-xs text-muted-foreground underline underline-offset-4"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="rounded-none" />
              </div>
            )}

            {error && <p className="text-xs text-destructive">{error}</p>}

            <Button type="submit" disabled={submitting} className="h-11 w-full rounded-none text-[11px] uppercase tracking-[0.18em]">
              {submitting
                ? "Please wait…"
                : mode === "login"
                  ? "Sign in"
                  : mode === "signup"
                    ? "Create account"
                    : "Send reset link"}
            </Button>

            {mode === "forgot" ? (
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError(null);
                }}
                className="w-full text-center text-xs text-muted-foreground underline underline-offset-4"
              >
                Back to sign in
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMode(mode === "login" ? "signup" : "login");
                  setError(null);
                }}
                className="w-full text-center text-xs text-muted-foreground underline underline-offset-4"
              >
                {mode === "login" ? "New here? Create an account" : "Already have an account? Sign in"}
              </button>
            )}
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

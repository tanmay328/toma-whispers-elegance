import { useState } from "react";
import { CheckCircle2, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";

type CartLine = { product: { id: number; name: string; price: number; color: string }; size: string; quantity: number };

export function CheckoutForm({
  cart,
  subtotal,
  onPlaced,
}: {
  cart: CartLine[];
  subtotal: number;
  onPlaced: (orderId: string) => void;
}) {
  const { user } = useAuth();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName || !phone || !address) {
      setError("Please fill in your name, phone, and delivery address.");
      return;
    }

    setSubmitting(true);
    const { data, error: insertError } = await supabase
      .from("orders")
      .insert({
        user_id: user?.id ?? null,
        full_name: fullName,
        phone,
        address,
        items: cart.map((line) => ({
          product_id: line.product.id,
          name: line.product.name,
          color: line.product.color,
          size: line.size,
          quantity: line.quantity,
          price: line.product.price,
        })),
        subtotal,
        payment_method: "cod",
        status: "pending_cod",
      })
      .select("id")
      .single();
    setSubmitting(false);

    if (insertError || !data) {
      setError("Something went wrong placing your order. Please try again.");
      return;
    }

    onPlaced(data.id as string);
  };

  return (
    <form onSubmit={handleSubmit} className="flex-1 space-y-5 overflow-y-auto p-6">
      <div className="space-y-1.5">
        <Label htmlFor="co-name">Full name</Label>
        <Input id="co-name" value={fullName} onChange={(e) => setFullName(e.target.value)} className="rounded-none" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="co-phone">Phone number</Label>
        <Input id="co-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="rounded-none" placeholder="For delivery coordination" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="co-address">Delivery address</Label>
        <Textarea id="co-address" value={address} onChange={(e) => setAddress(e.target.value)} className="min-h-20 rounded-none" />
      </div>

      <div className="space-y-2 pt-1">
        <Label>Payment method</Label>

        <div className="flex items-start gap-3 border border-border p-4">
          <Truck className="mt-0.5 size-4 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium">Cash on Delivery</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Pay in cash when your order arrives.</p>
          </div>
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-foreground" />
        </div>

        <div className="flex items-start gap-3 border border-dashed border-border p-4 opacity-50">
          <div className="mt-0.5 size-4 shrink-0 rounded-full border border-muted-foreground" />
          <div className="flex-1">
            <p className="text-sm font-medium">Card / Online payment</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Coming soon.</p>
          </div>
        </div>
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      <div className="flex justify-between border-t border-border pt-5">
        <span className="text-sm">Total (pay on delivery)</span>
        <span className="font-serif text-xl">€{subtotal.toLocaleString()}</span>
      </div>

      <Button type="submit" disabled={submitting} className="h-12 w-full rounded-none text-[11px] uppercase tracking-[0.18em]">
        {submitting ? "Placing order…" : "Place order · Cash on Delivery"}
      </Button>
    </form>
  );
}

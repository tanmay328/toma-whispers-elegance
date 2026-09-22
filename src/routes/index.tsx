import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowDown,
  Check,
  Heart,
  LogOut,
  Minus,
  PackageCheck,
  Plus,
  Search,
  ShieldCheck,
  ShoppingBag,
  SlidersHorizontal,
  User,
  X,
} from "lucide-react";

import heroImage from "@/assets/toma-hero.jpg";
import lookOne from "@/assets/toma-look-1.jpg";
import lookTwo from "@/assets/toma-look-2.jpg";
import lookThree from "@/assets/toma-look-3.jpg";
import { Button } from "@/components/ui/button";
import { AuthDialog } from "@/components/auth-dialog";
import { CheckoutForm } from "@/components/checkout-form";
import { useAuth } from "@/lib/auth-context";
import { usePersistentState } from "@/lib/use-persistent-state";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { type Product, products } from "@/lib/toma-products";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TOMA — Quiet Luxury Menswear" },
      {
        name: "description",
        content: "TOMA creates timeless menswear in cashmere, linen, wool and Italian leather.",
      },
      { property: "og:title", content: "TOMA — Quiet Luxury Menswear" },
      {
        property: "og:description",
        content: "A considered collection of natural fibers and enduring Italian craftsmanship.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TomaStore,
});

type CartLine = { product: Product; size: string; quantity: number };
const categories = ["All", "Shirts", "Pants", "Shoes", "Bags"];
const materials = ["Cashmere", "Linen", "Wool", "Leather/Suede"];
const colors = ["Taupe", "Ivory", "Oatmeal", "Warm Sand", "Charcoal", "Espresso"];
const swatches: Record<string, string> = {
  Taupe: "bg-swatch-taupe",
  Ivory: "bg-swatch-ivory",
  Oatmeal: "bg-swatch-oatmeal",
  "Warm Sand": "bg-swatch-sand",
  Charcoal: "bg-swatch-charcoal",
  Espresso: "bg-swatch-espresso",
  "Soft Slate": "bg-swatch-slate",
};

function TomaStore() {
  const { user, signOut } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [category, setCategory] = useState("All");
  const [material, setMaterial] = useState("");
  const [color, setColor] = useState("");
  const [size, setSize] = useState("");
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [bagOpen, setBagOpen] = useState(false);
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [wishlist, setWishlist] = usePersistentState<number[]>("toma-wishlist", []);
  const [cart, setCart] = usePersistentState<CartLine[]>("toma-cart", []);
  const [bagStep, setBagStep] = useState<"cart" | "checkout" | "done">("cart");
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      products.filter(
        (product) =>
          (category === "All" || product.category === category) &&
          (!material || product.material === material) &&
          (!color || product.color === color) &&
          (!size || product.sizes.includes(size)) &&
          (!query || `${product.name} ${product.category} ${product.material}`.toLowerCase().includes(query.toLowerCase())),
      ),
    [category, material, color, size, query],
  );

  const bagCount = cart.reduce((sum, line) => sum + line.quantity, 0);
  const subtotal = cart.reduce((sum, line) => sum + line.product.price * line.quantity, 0);

  const openProduct = (product: Product) => {
    setActiveProduct(product);
    setSelectedSize("");
  };

  const addToBag = (product: Product, pickedSize?: string) => {
    const finalSize = pickedSize ?? product.sizes[0];
    if (!finalSize) return;
    setCart((current) => {
      const match = current.find((line) => line.product.id === product.id && line.size === finalSize);
      if (match) {
        return current.map((line) =>
          line === match ? { ...line, quantity: line.quantity + 1 } : line,
        );
      }
      return [...current, { product, size: finalSize, quantity: 1 }];
    });
    setActiveProduct(null);
    setBagOpen(true);
  };

  const updateQuantity = (index: number, delta: number) => {
    setCart((current) =>
      current
        .map((line, lineIndex) =>
          lineIndex === index ? { ...line, quantity: line.quantity + delta } : line,
        )
        .filter((line) => line.quantity > 0),
    );
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="fixed inset-x-0 top-0 z-40 border-b border-primary-foreground/20 bg-primary/90 text-primary-foreground backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-5 lg:px-10">
          <a href="#top" className="font-serif text-3xl font-medium tracking-[0.16em]" aria-label="TOMA home">
            TOMA
          </a>
          <nav className="hidden items-center gap-8 md:flex" aria-label="Collection navigation">
            {categories.map((item) => (
              <Button
                key={item}
                variant="ghost"
                onClick={() => {
                  setCategory(item);
                  document.getElementById("collection")?.scrollIntoView();
                }}
                className={cn(
                  "h-auto rounded-none px-0 py-2 text-[11px] uppercase tracking-[0.2em] text-primary-foreground hover:bg-transparent hover:text-primary-foreground",
                  category === item && "border-b border-primary-foreground",
                )}
              >
                {item}
              </Button>
            ))}
          </nav>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => setSearchOpen(true)} className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground" aria-label="Search">
              <Search />
            </Button>
            {user ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => signOut()}
                className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                aria-label={`Sign out of ${user.email}`}
                title={user.email ?? undefined}
              >
                <LogOut />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setAuthOpen(true)}
                className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                aria-label="Sign in or create account"
              >
                <User />
              </Button>
            )}
            <Button variant="ghost" size="icon" className="relative text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground" aria-label={`Wishlist with ${wishlist.length} items`}>
              <Heart />
              {wishlist.length > 0 && <CountBadge count={wishlist.length} />}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setBagOpen(true)} className="relative text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground" aria-label={`Shopping bag with ${bagCount} items`}>
              <ShoppingBag />
              {bagCount > 0 && <CountBadge count={bagCount} />}
            </Button>
          </div>
        </div>
      </header>

      <section id="top" className="relative min-h-[88vh] overflow-hidden">
        <img src={heroImage} width={1920} height={1080} alt="TOMA summer tailoring in a travertine colonnade" className="absolute inset-0 h-full w-full object-cover object-[58%_center]" />
        <div className="absolute inset-0 bg-hero-overlay" />
        <div className="relative mx-auto flex min-h-[88vh] max-w-[1600px] items-end px-5 pb-14 lg:px-10 lg:pb-20">
          <div className="max-w-2xl text-primary-foreground">
            <p className="mb-5 text-[11px] font-medium uppercase tracking-[0.28em]">Autumn / Winter 2026</p>
            <h1 className="font-serif text-6xl leading-[0.92] font-normal sm:text-7xl lg:text-8xl">
              The art of<br />quiet presence
            </h1>
            <p className="mt-6 max-w-lg text-sm leading-7 text-primary-foreground/80 sm:text-base">
              Natural fibers, unhurried silhouettes, and the enduring hand of Italian craftsmanship.
            </p>
            <Button asChild variant="outline" className="mt-8 h-12 rounded-none border-primary-foreground bg-transparent px-7 text-[11px] uppercase tracking-[0.2em] text-primary-foreground hover:bg-primary-foreground hover:text-primary">
              <a href="#collection">Explore the collection <ArrowDown /></a>
            </Button>
          </div>
        </div>
      </section>

      <section id="collection" className="mx-auto max-w-[1600px] px-5 py-20 lg:px-10 lg:py-28">
        <div className="mb-10 flex items-end justify-between gap-4 border-b border-border pb-6">
          <div>
            <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">The collection</p>
            <h2 className="mt-2 font-serif text-4xl sm:text-5xl">Objects of lasting value</h2>
          </div>
          <Button variant="outline" onClick={() => setFilterOpen(!filterOpen)} className="rounded-none text-[11px] uppercase tracking-[0.16em]">
            <SlidersHorizontal /> Filter
          </Button>
        </div>

        <div className="mb-8 flex gap-5 overflow-x-auto border-b border-border pb-4 md:hidden">
          {categories.map((item) => (
            <Button key={item} variant="ghost" onClick={() => setCategory(item)} className={cn("h-auto rounded-none p-0 text-xs uppercase tracking-[0.16em]", category === item && "border-b border-foreground pb-3")}>
              {item}
            </Button>
          ))}
        </div>

        {filterOpen && (
          <div className="mb-10 grid gap-7 border-b border-border pb-8 sm:grid-cols-2 lg:grid-cols-4">
            <FilterGroup label="Material" options={materials} value={material} onChange={setMaterial} />
            <FilterGroup label="Colour" options={colors} value={color} onChange={setColor} swatch />
            <FilterGroup label="Size" options={["S", "M", "L", "XL", "32", "34", "42", "43"]} value={size} onChange={setSize} />
            <div className="flex items-end">
              <Button variant="link" onClick={() => { setMaterial(""); setColor(""); setSize(""); }} className="px-0 text-xs uppercase tracking-[0.16em]">Clear filters</Button>
            </div>
          </div>
        )}

        <p className="mb-5 text-xs text-muted-foreground">{filtered.length} pieces</p>
        <div className="grid grid-cols-2 gap-x-3 gap-y-10 lg:grid-cols-3 lg:gap-x-6 lg:gap-y-16">
          {filtered.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              wished={wishlist.includes(product.id)}
              onOpen={() => openProduct(product)}
              onWish={() => setWishlist((items) => items.includes(product.id) ? items.filter((id) => id !== product.id) : [...items, product.id])}
              onAdd={() => addToBag(product)}
            />
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="py-24 text-center">
            <p className="font-serif text-3xl">No pieces match your selection.</p>
            <Button variant="link" onClick={() => { setCategory("All"); setMaterial(""); setColor(""); setSize(""); setQuery(""); }}>Clear all filters</Button>
          </div>
        )}
      </section>

      <section className="grid bg-primary text-primary-foreground lg:grid-cols-2">
        <div className="grid min-h-[560px] grid-cols-2">
          <img src={lookThree} loading="lazy" width={1200} height={1600} alt="TOMA charcoal wool tailoring" className="h-full w-full object-cover" />
          <img src={lookTwo} loading="lazy" width={1200} height={1600} alt="TOMA leather accessories" className="h-full w-full object-cover" />
        </div>
        <div className="flex items-center px-7 py-20 sm:px-14 lg:px-20">
          <div className="max-w-xl">
            <p className="text-[10px] uppercase tracking-[0.28em] text-primary-foreground/60">The TOMA philosophy</p>
            <h2 className="mt-6 font-serif text-5xl leading-none sm:text-6xl">Made with time,<br />made to transcend it.</h2>
            <p className="mt-8 text-sm leading-7 text-primary-foreground/70">
              We choose noble natural fibers for how they feel, breathe, and age. Every piece passes through expert hands—people whose knowledge lives in touch, proportion, and patience.
            </p>
            <div className="mt-10 grid gap-8 border-t border-primary-foreground/20 pt-8 sm:grid-cols-3">
              {["Natural fibers", "Human craft", "Timeless form"].map((value, index) => (
                <div key={value}><span className="font-serif text-2xl">0{index + 1}</span><p className="mt-2 text-[10px] uppercase tracking-[0.18em] text-primary-foreground/70">{value}</p></div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-footer px-5 py-14 text-footer-foreground lg:px-10">
        <div className="mx-auto flex max-w-[1600px] flex-col justify-between gap-10 border-b border-footer-foreground/20 pb-12 sm:flex-row">
          <div><p className="font-serif text-4xl tracking-[0.16em]">TOMA</p><p className="mt-3 text-xs text-footer-foreground/60">Considered menswear, made in Italy.</p></div>
          <div className="grid grid-cols-2 gap-16 text-xs leading-7 text-footer-foreground/70"><div><p className="mb-2 uppercase tracking-[0.18em] text-footer-foreground">Client care</p><p>Shipping & returns</p><p>Care guide</p><p>Contact</p></div><div><p className="mb-2 uppercase tracking-[0.18em] text-footer-foreground">TOMA</p><p>Our philosophy</p><p>Craftsmanship</p><p>Journal</p></div></div>
        </div>
        <p className="mx-auto mt-6 max-w-[1600px] text-[10px] uppercase tracking-[0.14em] text-footer-foreground/40">© 2026 TOMA · Italy</p>
      </footer>

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} query={query} setQuery={setQuery} results={filtered.slice(0, 5)} onOpen={openProduct} />
      <ProductDialog product={activeProduct} open={Boolean(activeProduct)} onOpenChange={(open) => !open && setActiveProduct(null)} selectedSize={selectedSize} setSelectedSize={setSelectedSize} onAdd={addToBag} onOpenProduct={openProduct} />
      <BagDrawer open={bagOpen} setOpen={setBagOpen} cart={cart} setCart={setCart} subtotal={subtotal} updateQuantity={updateQuantity} bagStep={bagStep} setBagStep={setBagStep} placedOrderId={placedOrderId} setPlacedOrderId={setPlacedOrderId} />
      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
    </main>
  );
}

function CountBadge({ count }: { count: number }) {
  return <span className="absolute right-0 top-0 flex size-4 items-center justify-center rounded-full bg-accent text-[9px] text-accent-foreground">{count}</span>;
}

function FilterGroup({ label, options, value, onChange, swatch = false }: { label: string; options: string[]; value: string; onChange: (value: string) => void; swatch?: boolean }) {
  return <div><p className="mb-3 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</p><div className="flex flex-wrap gap-2">{options.map((option) => <Button key={option} variant={value === option ? "default" : "outline"} size="sm" onClick={() => onChange(value === option ? "" : option)} className="rounded-none font-normal">{swatch && <span className={cn("size-3 rounded-full border border-border", swatches[option])} />}{option}</Button>)}</div></div>;
}

function ProductCard({ product, wished, onOpen, onWish, onAdd }: { product: Product; wished: boolean; onOpen: () => void; onWish: () => void; onAdd: () => void }) {
  return (
    <article className="group">
      <div className="relative aspect-[3/4] overflow-hidden bg-muted">
        <button onClick={onOpen} className="absolute inset-0 z-10 cursor-pointer" aria-label={`View ${product.name}`} />
        <img src={product.image} loading="lazy" width={1200} height={1600} alt={product.name} className="h-full w-full object-cover transition-opacity duration-700 group-hover:opacity-0" />
        <img src={product.hoverImage} loading="lazy" width={1200} height={1600} alt="" className="absolute inset-0 h-full w-full object-cover opacity-0 transition-all duration-700 group-hover:scale-[1.02] group-hover:opacity-100" />
        <Button variant="ghost" size="icon" onClick={onWish} className="absolute right-3 top-3 z-20 bg-background/75 hover:bg-background" aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}><Heart className={wished ? "fill-foreground" : ""} /></Button>
        <Button onClick={onAdd} className="absolute inset-x-3 bottom-3 z-20 h-11 translate-y-16 rounded-none text-[10px] uppercase tracking-[0.18em] opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100">Quick add</Button>
      </div>
      <button onClick={onOpen} className="mt-4 w-full cursor-pointer text-left">
        <div className="flex items-start justify-between gap-2"><h3 className="font-serif text-lg leading-tight sm:text-xl">{product.name}</h3><span className="text-xs sm:text-sm">€{product.price.toLocaleString()}</span></div>
        <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{product.material} · {product.color}</p>
        <span className={cn("mt-3 block size-3 rounded-full border border-border", swatches[product.color])} aria-label={product.color} />
      </button>
    </article>
  );
}

function SearchDialog({ open, onOpenChange, query, setQuery, results, onOpen }: { open: boolean; onOpenChange: (open: boolean) => void; query: string; setQuery: (query: string) => void; results: Product[]; onOpen: (product: Product) => void }) {
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="top-0 max-w-none translate-y-0 rounded-none border-x-0 p-6 sm:top-0 sm:rounded-none"><DialogHeader><DialogTitle className="font-serif text-3xl font-normal">Search TOMA</DialogTitle><DialogDescription>Search by piece, material, or category.</DialogDescription></DialogHeader><div className="flex border-b border-foreground py-3"><Search className="mr-3" /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="What are you looking for?" className="w-full bg-transparent text-lg outline-none placeholder:text-muted-foreground" /></div>{query && <div className="grid gap-2 pt-2">{results.map((product) => <Button key={product.id} variant="ghost" onClick={() => { onOpenChange(false); onOpen(product); }} className="h-auto justify-between rounded-none px-0 py-3 font-normal"><span>{product.name}</span><span className="text-muted-foreground">€{product.price}</span></Button>)}{results.length === 0 && <p className="py-6 text-sm text-muted-foreground">No matching pieces.</p>}</div>}</DialogContent></Dialog>;
}

function ProductDialog({ product, open, onOpenChange, selectedSize, setSelectedSize, onAdd, onOpenProduct }: { product: Product | null; open: boolean; onOpenChange: (open: boolean) => void; selectedSize: string; setSelectedSize: (size: string) => void; onAdd: (product: Product, size?: string) => void; onOpenProduct: (product: Product) => void }) {
  if (!product) return null;
  const companions = products.filter((item) => item.category !== product.category).slice(0, 3);
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="h-[94vh] max-w-[1180px] overflow-y-auto rounded-none p-0"><DialogTitle className="sr-only">{product.name}</DialogTitle><DialogDescription className="sr-only">Product details and specifications</DialogDescription><div className="grid lg:grid-cols-[1.15fr_.85fr]"><div className="grid grid-cols-2 gap-px bg-border"><img src={product.image} width={1200} height={1600} alt={product.name} className="col-span-2 h-auto w-full object-cover sm:col-span-1 sm:h-full" /><img src={product.hoverImage} width={1200} height={1600} alt={`${product.name} alternate view`} className="hidden h-full w-full object-cover sm:block" /></div><div className="p-6 sm:p-10 lg:sticky lg:top-0 lg:self-start"><p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{product.category} · {product.material}</p><div className="mt-3 flex items-start justify-between gap-5"><h2 className="font-serif text-4xl leading-none">{product.name}</h2><p className="text-sm">€{product.price.toLocaleString()}</p></div><p className="mt-5 text-sm leading-6 text-muted-foreground">{product.description}</p><div className="mt-8 flex items-center justify-between"><p className="text-xs uppercase tracking-[0.15em]">Select size</p><Button variant="link" className="h-auto p-0 text-xs">Size guide</Button></div><div className="mt-3 grid grid-cols-5 gap-2">{product.sizes.map((item) => <Button key={item} variant={selectedSize === item ? "default" : "outline"} onClick={() => setSelectedSize(item)} className="rounded-none">{item}</Button>)}</div>{product.lowStock && <p className="mt-3 text-xs text-muted-foreground">{product.lowStock}</p>}<Button disabled={!selectedSize} onClick={() => onAdd(product, selectedSize)} className="mt-6 h-12 w-full rounded-none text-[11px] uppercase tracking-[0.2em]">{selectedSize ? "Add to bag" : "Choose a size"}</Button><div className="mt-4 flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.12em] text-muted-foreground"><ShieldCheck className="size-4" /> Free insured shipping & complimentary packaging</div><Accordion type="single" collapsible className="mt-8"><SpecItem value="composition" label="Fabric & composition" text={product.specs.composition} /><SpecItem value="fit" label="Fit & silhouette" text={product.specs.fit} /><SpecItem value="finishing" label="Finishing & hardware" text={product.specs.finishing} /><SpecItem value="care" label="Care instructions" text={product.specs.care} /><SpecItem value="provenance" label="Provenance" text={product.specs.provenance} /></Accordion></div></div><div className="border-t border-border p-6 sm:p-10"><p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Complete the look</p><h3 className="mt-2 font-serif text-3xl">Considered companions</h3><div className="mt-6 grid grid-cols-3 gap-3">{companions.map((item) => <button key={item.id} onClick={() => onOpenProduct(item)} className="cursor-pointer text-left"><img src={item.image} loading="lazy" width={1200} height={1600} alt={item.name} className="aspect-[3/4] w-full object-cover" /><p className="mt-2 font-serif text-sm sm:text-lg">{item.name}</p><p className="text-[10px] text-muted-foreground">€{item.price}</p></button>)}</div></div></DialogContent></Dialog>;
}

function SpecItem({ value, label, text }: { value: string; label: string; text: string }) { return <AccordionItem value={value}><AccordionTrigger className="text-[11px] uppercase tracking-[0.14em] hover:no-underline">{label}</AccordionTrigger><AccordionContent className="leading-6 text-muted-foreground">{text}</AccordionContent></AccordionItem>; }

function BagDrawer({
  open,
  setOpen,
  cart,
  setCart,
  subtotal,
  updateQuantity,
  bagStep,
  setBagStep,
  placedOrderId,
  setPlacedOrderId,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  cart: CartLine[];
  setCart: (cart: CartLine[]) => void;
  subtotal: number;
  updateQuantity: (index: number, delta: number) => void;
  bagStep: "cart" | "checkout" | "done";
  setBagStep: (step: "cart" | "checkout" | "done") => void;
  placedOrderId: string | null;
  setPlacedOrderId: (id: string | null) => void;
}) {
  return (
    <Sheet
      open={open}
      onOpenChange={(value) => {
        setOpen(value);
        if (!value) setBagStep("cart");
      }}
    >
      <SheetContent className="flex w-full flex-col p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border p-6 text-left">
          <SheetTitle className="font-serif text-3xl font-normal">
            {bagStep === "checkout" ? "Delivery details" : "Your bag"}
          </SheetTitle>
          <SheetDescription>
            {bagStep === "checkout"
              ? "Cash on Delivery — pay when it arrives."
              : cart.length
                ? `${cart.length} considered ${cart.length === 1 ? "piece" : "pieces"}`
                : "Your selection is empty"}
          </SheetDescription>
        </SheetHeader>

        {bagStep === "done" ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <span className="flex size-16 items-center justify-center rounded-full bg-secondary">
              <Check className="size-7" />
            </span>
            <h3 className="mt-6 font-serif text-4xl">Order placed.</h3>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Your order is confirmed for Cash on Delivery.
              {placedOrderId && (
                <>
                  {" "}Reference: <span className="text-foreground">{placedOrderId.slice(0, 8)}</span>
                </>
              )}
              {" "}Pay in cash when it arrives at your door.
            </p>
            <Button
              onClick={() => {
                setOpen(false);
                setBagStep("cart");
                setPlacedOrderId(null);
              }}
              className="mt-8 rounded-none"
            >
              Continue exploring
            </Button>
          </div>
        ) : bagStep === "checkout" ? (
          <CheckoutForm
            cart={cart}
            subtotal={subtotal}
            onPlaced={(orderId) => {
              setPlacedOrderId(orderId);
              setCart([]);
              setBagStep("done");
            }}
          />
        ) : cart.length ? (
          <>
            <div className="flex-1 space-y-5 overflow-y-auto p-6">
              {cart.map((line, index) => (
                <div key={`${line.product.id}-${line.size}`} className="flex gap-4 border-b border-border pb-5">
                  <img src={line.product.image} width={120} height={160} alt={line.product.name} className="h-32 w-24 object-cover" />
                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between gap-3">
                      <div>
                        <p className="font-serif text-lg">{line.product.name}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Size {line.size} · {line.product.color}
                        </p>
                      </div>
                      <p className="text-xs">€{(line.product.price * line.quantity).toLocaleString()}</p>
                    </div>
                    <div className="mt-auto flex w-fit items-center border border-border">
                      <Button variant="ghost" size="icon" onClick={() => updateQuantity(index, -1)} className="size-8 rounded-none" aria-label="Decrease quantity">
                        <Minus />
                      </Button>
                      <span className="w-8 text-center text-xs">{line.quantity}</span>
                      <Button variant="ghost" size="icon" onClick={() => updateQuantity(index, 1)} className="size-8 rounded-none" aria-label="Increase quantity">
                        <Plus />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-border p-6">
              <div className="mb-3 flex items-center gap-3 text-xs text-muted-foreground">
                <PackageCheck className="size-4" />
                <span>Complimentary luxury packaging</span>
              </div>
              <div className="mb-5 flex items-center gap-3 text-xs text-muted-foreground">
                <ShieldCheck className="size-4" />
                <span>Free insured express shipping</span>
              </div>
              <div className="flex justify-between border-t border-border pt-5">
                <span className="text-sm">Subtotal</span>
                <span className="font-serif text-xl">€{subtotal.toLocaleString()}</span>
              </div>
              <p className="mt-1 text-[10px] text-muted-foreground">Cash on Delivery available. Card payment coming soon.</p>
              <Button onClick={() => setBagStep("checkout")} className="mt-5 h-12 w-full rounded-none text-[11px] uppercase tracking-[0.18em]">
                Checkout
              </Button>
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <ShoppingBag className="size-8 text-muted-foreground" />
            <p className="mt-5 font-serif text-3xl">
              An empty bag,
              <br />
              for now.
            </p>
            <Button onClick={() => setOpen(false)} variant="outline" className="mt-7 rounded-none">
              Explore the collection
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
import { ArrowRight, Camera } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function Landing() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen max-w-shell flex-col px-6">
        <header className="flex items-center justify-between py-6">
          <div className="flex items-center gap-2 font-semibold tracking-tight">
            <Camera className="size-5" aria-hidden="true" />
            <span>Studio Suite</span>
          </div>
          <nav className="text-sm text-muted-foreground">
            <a className="transition-colors hover:text-foreground" href="/studio">
              Studio sign in
            </a>
          </nav>
        </header>

        <section className="flex flex-1 flex-col items-start justify-center gap-6 py-20 animate-fade-in">
          <span className="rounded-full border px-3 py-1 text-xs uppercase tracking-widest text-muted-foreground">
            Now in foundation
          </span>
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
            One studio platform for portfolios, client galleries, and high-resolution
            delivery.
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground">
            Studio Suite is the home for your work and your clients — a public showcase
            up front, a private admin studio behind it, and fast, secure media delivery
            underneath. This is the public marketing entry point.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button size="lg" asChild>
              <a href="/studio">
                Enter the studio
                <ArrowRight aria-hidden="true" />
              </a>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="#portfolio">View portfolio</a>
            </Button>
          </div>
        </section>

        <footer className="border-t py-6 text-sm text-muted-foreground">
          © {new Date().getFullYear()} Studio Suite
        </footer>
      </div>
    </main>
  );
}

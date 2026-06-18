import { Link } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";

export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const cls =
    size === "lg" ? "text-4xl md:text-5xl" :
    size === "sm" ? "text-lg" : "text-2xl";
  const iconSize =
    size === "lg" ? "h-9 w-9 md:h-11 md:w-11" :
    size === "sm" ? "h-5 w-5" : "h-6 w-6";
  return (
    <Link to="/" className={`font-display font-extrabold tracking-tight inline-flex items-center gap-2 ${cls}`}>
      <span>Pode</span>
      <span className="inline-flex items-center justify-center rounded-xl bg-primary/15 p-1.5 text-primary">
        <MessageCircle className={iconSize} fill="currentColor" strokeWidth={0} />
      </span>
      <span>Postar</span>
    </Link>
  );
}

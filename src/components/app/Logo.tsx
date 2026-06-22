import { Link } from "@tanstack/react-router";

export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const cls = size === "lg" ? "text-4xl md:text-5xl" : size === "sm" ? "text-lg" : "text-2xl";
  return (
    <Link
      to="/"
      className={`font-display font-extrabold tracking-tight inline-flex items-center ${cls}`}
    >
      <span>Gama</span>
      <span className="text-primary">Git</span>
    </Link>
  );
}

import { useEffect, useState } from "react";

export type LayoutBreakpoint = "desktop" | "compact" | "mobile";

function computeBreakpoint(width: number): LayoutBreakpoint {
  if (width >= 1200) return "desktop";
  if (width >= 800) return "compact";
  return "mobile";
}

export function useResponsiveLayout(): LayoutBreakpoint {
  const [breakpoint, setBreakpoint] = useState<LayoutBreakpoint>(() =>
    computeBreakpoint(typeof window !== "undefined" ? window.innerWidth : 1200),
  );

  useEffect(() => {
    const handleResize = () => setBreakpoint(computeBreakpoint(window.innerWidth));
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return breakpoint;
}

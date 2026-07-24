import type { Domain } from "../types/universe";

export function domainColorVar(domainId: string): string {
  return `--domain-${domainId}`;
}

export function applyDomainTheme(domains: Domain[]): void {
  const root = document.documentElement;
  for (const domain of domains) {
    root.style.setProperty(domainColorVar(domain.id), domain.color);
  }
}

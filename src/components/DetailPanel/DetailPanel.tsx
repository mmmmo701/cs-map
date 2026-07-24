import { useEffect, useRef } from "react";
import type { UniverseIndex } from "../../data/buildIndexes";
import { isConstellationNode, isDomain, isFieldNode } from "../../data/selectors";
import { useUniverseStore } from "../../state/universeStore";
import { FieldDetail } from "./FieldDetail";
import { ConstellationDetail } from "./ConstellationDetail";
import { DomainDetail } from "./DomainDetail";
import styles from "./DetailPanel.module.css";

interface DetailPanelProps {
  index: UniverseIndex;
  asSheet: boolean;
}

export function DetailPanel({ index, asSheet }: DetailPanelProps) {
  const selectedNodeId = useUniverseStore((s) => s.selectedNodeId);
  const detailsPanelOpen = useUniverseStore((s) => s.detailsPanelOpen);
  const setDetailsPanelOpen = useUniverseStore((s) => s.setDetailsPanelOpen);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);
  const wasOpenRef = useRef(false);

  const node = selectedNodeId ? index.nodeById.get(selectedNodeId) : undefined;
  const isOpen = detailsPanelOpen && !!node;

  useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      lastFocusedRef.current = document.activeElement as HTMLElement | null;
      headingRef.current?.focus();
    }
    if (!isOpen && wasOpenRef.current) {
      lastFocusedRef.current?.focus?.();
    }
    wasOpenRef.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    function handleKeydown(event: KeyboardEvent) {
      if (event.key === "Escape" && isOpen) {
        setDetailsPanelOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [isOpen, setDetailsPanelOpen]);

  if (!isOpen || !node) return null;

  return (
    <aside
      className={styles.panel}
      data-sheet={asSheet || undefined}
      aria-label="Details"
      role={asSheet ? "dialog" : "complementary"}
      aria-modal={asSheet || undefined}
    >
      <div className={styles.header}>
        <h2 ref={headingRef} tabIndex={-1} className={styles.heading}>
          {node.name}
        </h2>
        <button
          type="button"
          className={styles.close}
          onClick={() => setDetailsPanelOpen(false)}
          aria-label="Close details"
        >
          ×
        </button>
      </div>

      {isFieldNode(node) && <FieldDetail index={index} field={node} />}
      {isConstellationNode(node) && <ConstellationDetail index={index} constellation={node} />}
      {isDomain(node) && <DomainDetail index={index} domain={node} />}
    </aside>
  );
}

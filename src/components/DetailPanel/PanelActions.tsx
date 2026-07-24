import { useState } from "react";
import { useUniverseStore } from "../../state/universeStore";
import type { NodeId } from "../../types/universe";
import styles from "./DetailPanel.module.css";

interface PanelActionsProps {
  nodeId: NodeId;
}

export function PanelActions({ nodeId }: PanelActionsProps) {
  const setView = useUniverseStore((s) => s.setView);
  const selectNode = useUniverseStore((s) => s.selectNode);
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard API unavailable (e.g. insecure context) — silently ignore.
    }
  }

  return (
    <div className={styles.actions}>
      <button
        type="button"
        onClick={() => {
          selectNode(nodeId, { openPanel: true });
          setView("landscape");
        }}
      >
        View in Landscape
      </button>
      <button
        type="button"
        onClick={() => {
          selectNode(nodeId, { openPanel: false });
          setView("connections");
        }}
      >
        Explore connections
      </button>
      <button type="button" onClick={copyLink}>
        {copied ? "Link copied" : "Copy link"}
      </button>
    </div>
  );
}

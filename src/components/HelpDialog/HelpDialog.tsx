import { useEffect, useRef } from "react";
import type { Metadata } from "../../types/universe";
import styles from "./HelpDialog.module.css";

interface HelpDialogProps {
  metadata: Metadata;
  open: boolean;
  onClose: () => void;
}

export function HelpDialog({ metadata, open, onClose }: HelpDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const { coordinate_system: coords } = metadata;

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      onClose={onClose}
      onCancel={onClose}
      aria-labelledby="help-dialog-title"
    >
      <div className={styles.content}>
        <header className={styles.header}>
          <h2 id="help-dialog-title">How to read this map</h2>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Close help">
            ×
          </button>
        </header>

        <p>{metadata.subtitle}</p>
        <p className={styles.note}>{metadata.content_note}</p>

        <section>
          <h3>The conceptual axes</h3>
          <dl className={styles.axisList}>
            <div>
              <dt>
                Horizontal — {coords.x.left_label} to {coords.x.right_label}
              </dt>
              <dd>{coords.x.definition}</dd>
            </div>
            <div>
              <dt>
                Vertical — {coords.y.bottom_label} to {coords.y.top_label}
              </dt>
              <dd>{coords.y.definition}</dd>
            </div>
          </dl>
        </section>

        <section>
          <h3>Taxonomy principles</h3>
          <ul className={styles.principles}>
            {metadata.taxonomy_principles.map((principle) => (
              <li key={principle}>{principle}</li>
            ))}
          </ul>
        </section>

        <section>
          <h3>Visual grammar</h3>
          <ul className={styles.legend}>
            <li>
              <span className={styles.legendGlyphCircle} aria-hidden="true" /> Ordinary field — single-color
              border
            </li>
            <li>
              <span className={styles.legendGlyphSegmented} aria-hidden="true" /> Bridge field — segmented
              border across its domains
            </li>
            <li>
              <span className={styles.legendGlyphStar} aria-hidden="true" /> Constellation — cross-cutting,
              hidden by default
            </li>
          </ul>
        </section>

        <section>
          <h3>Keyboard shortcuts</h3>
          <ul className={styles.shortcuts}>
            <li>
              <kbd>/</kbd> focus search
            </li>
            <li>
              <kbd>Enter</kbd> select the focused node
            </li>
            <li>
              <kbd>Esc</kbd> close panel or dialog
            </li>
            <li>
              <kbd>Arrows</kbd> move between nearby nodes on the map
            </li>
          </ul>
        </section>
      </div>
    </dialog>
  );
}

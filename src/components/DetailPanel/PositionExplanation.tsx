import type { ConceptualPosition, Metadata } from "../../types/universe";
import { describePosition } from "../../data/positionDescription";
import styles from "./DetailPanel.module.css";

interface PositionExplanationProps {
  position: ConceptualPosition;
  metadata: Metadata;
}

export function PositionExplanation({ position, metadata }: PositionExplanationProps) {
  const { x, y } = metadata.coordinate_system;
  return (
    <div>
      <p>{describePosition(position, x, y)}</p>
      <p className={styles.confidenceNote}>Editorial confidence: {position.confidence}.</p>
      <details className={styles.coordinateDisclosure}>
        <summary>Exact coordinates</summary>
        <p>
          {x.name}: {position.abstract_to_concrete} / {y.name}: {position.machine_to_human} (0–100 scale)
        </p>
      </details>
    </div>
  );
}

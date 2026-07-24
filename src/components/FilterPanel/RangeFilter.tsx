import { useEffect, useState } from "react";
import styles from "./FilterPanel.module.css";

interface RangeFilterProps {
  label: string;
  lowLabel: string;
  highLabel: string;
  value: [number, number];
  onChange: (value: [number, number]) => void;
}

export function RangeFilter({ label, lowLabel, highLabel, value, onChange }: RangeFilterProps) {
  const [local, setLocal] = useState(value);

  useEffect(() => setLocal(value), [value]);

  useEffect(() => {
    if (local[0] === value[0] && local[1] === value[1]) return;
    const timer = setTimeout(() => onChange(local), 80);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [local]);

  return (
    <div className={styles.rangeFilter}>
      <p className={styles.rangeLabel}>{label}</p>
      <div className={styles.rangeInputsRow}>
        <label className={styles.rangeNumberLabel}>
          <span className="visually-hidden">{lowLabel} minimum</span>
          <input
            type="number"
            min={0}
            max={100}
            value={local[0]}
            onChange={(e) => {
              const next = Math.min(Number(e.target.value), local[1]);
              setLocal([next, local[1]]);
            }}
          />
        </label>
        <span className={styles.rangeDash}>–</span>
        <label className={styles.rangeNumberLabel}>
          <span className="visually-hidden">{highLabel} maximum</span>
          <input
            type="number"
            min={0}
            max={100}
            value={local[1]}
            onChange={(e) => {
              const next = Math.max(Number(e.target.value), local[0]);
              setLocal([local[0], next]);
            }}
          />
        </label>
      </div>
      <div className={styles.sliderRow}>
        <input
          type="range"
          min={0}
          max={100}
          value={local[0]}
          aria-label={`${label} minimum`}
          onChange={(e) => setLocal([Math.min(Number(e.target.value), local[1]), local[1]])}
        />
        <input
          type="range"
          min={0}
          max={100}
          value={local[1]}
          aria-label={`${label} maximum`}
          onChange={(e) => setLocal([local[0], Math.max(Number(e.target.value), local[0])])}
        />
      </div>
      <div className={styles.rangeEndLabels}>
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
    </div>
  );
}

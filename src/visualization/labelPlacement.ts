export interface LabelCandidateInput {
  id: string;
  x: number;
  y: number;
  nodeRadius: number;
  text: string;
  priorityRank: number;
  alwaysVisible: boolean;
  /** "centered" tries a spot centered exactly on (x,y) first — used for domain
   * titles, which should sit at a fixed point rather than beside a node. */
  anchorMode?: "directional" | "centered";
  fontSize?: number;
}

export interface PlacedLabel {
  id: string;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  anchor: "start" | "end" | "middle";
  fontSize: number;
}

interface Rect {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

const FONT_SIZE = 12.5;
const MAX_LABEL_WIDTH = 220;

function estimateWidth(text: string, fontSize: number): number {
  return Math.min(MAX_LABEL_WIDTH, text.length * fontSize * 0.56);
}

function rectsOverlap(a: Rect, b: Rect): boolean {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}

/**
 * Deterministic, priority-ordered label placement. For each label (already
 * sorted by priority — selected/hovered/searched first, then display
 * priority) tries right, left, above, below the node in that order and
 * keeps the first candidate that neither collides with a higher-priority
 * label nor clips outside the viewport. Lower-priority labels are hidden
 * rather than allowed to overlap (section 11.10).
 */
export function placeLabels(
  labels: LabelCandidateInput[],
  viewport: { width: number; height: number },
): Map<string, PlacedLabel> {
  const placedRects: Rect[] = [];
  const result = new Map<string, PlacedLabel>();

  const sorted = [...labels].sort((a, b) => a.priorityRank - b.priorityRank);

  for (const label of sorted) {
    const fontSize = label.fontSize ?? FONT_SIZE;
    const width = estimateWidth(label.text, fontSize);
    const height = fontSize * 1.35;
    const gap = label.nodeRadius + 6;

    const directional: { x: number; y: number; anchor: "start" | "end" | "middle"; rect: Rect }[] = [
      {
        x: label.x + gap,
        y: label.y,
        anchor: "start",
        rect: { left: label.x + gap, right: label.x + gap + width, top: label.y - height / 2, bottom: label.y + height / 2 },
      },
      {
        x: label.x - gap,
        y: label.y,
        anchor: "end",
        rect: { left: label.x - gap - width, right: label.x - gap, top: label.y - height / 2, bottom: label.y + height / 2 },
      },
      {
        x: label.x,
        y: label.y - gap,
        anchor: "middle",
        rect: {
          left: label.x - width / 2,
          right: label.x + width / 2,
          top: label.y - gap - height,
          bottom: label.y - gap,
        },
      },
      {
        x: label.x,
        y: label.y + gap,
        anchor: "middle",
        rect: {
          left: label.x - width / 2,
          right: label.x + width / 2,
          top: label.y + gap,
          bottom: label.y + gap + height,
        },
      },
    ];

    const centered: (typeof directional)[number] = {
      x: label.x,
      y: label.y,
      anchor: "middle",
      rect: {
        left: label.x - width / 2,
        right: label.x + width / 2,
        top: label.y - height / 2,
        bottom: label.y + height / 2,
      },
    };

    const candidates = label.anchorMode === "centered" ? [centered, ...directional] : directional;

    let chosen: (typeof candidates)[number] | null = null;
    for (const candidate of candidates) {
      const clipped =
        candidate.rect.left < 0 ||
        candidate.rect.right > viewport.width ||
        candidate.rect.top < 0 ||
        candidate.rect.bottom > viewport.height;
      if (clipped && !label.alwaysVisible) continue;
      const collides = placedRects.some((r) => rectsOverlap(r, candidate.rect));
      if (collides && !label.alwaysVisible) continue;
      chosen = candidate;
      break;
    }

    if (!chosen) {
      if (!label.alwaysVisible) continue;
      chosen = candidates[0];
    }

    placedRects.push(chosen.rect);
    result.set(label.id, {
      id: label.id,
      text: label.text,
      x: chosen.x,
      y: chosen.y,
      width,
      height,
      anchor: chosen.anchor,
      fontSize,
    });
  }

  return result;
}

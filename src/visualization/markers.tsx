export const ARROW_MARKER_ID = "landscape-arrow";
export const ARROW_MARKER_ACTIVE_ID = "landscape-arrow-active";

export function EdgeMarkerDefs() {
  return (
    <defs>
      <marker
        id={ARROW_MARKER_ID}
        viewBox="0 0 10 10"
        refX="9"
        refY="5"
        markerWidth="6"
        markerHeight="6"
        orient="auto-start-reverse"
      >
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--edge-muted)" />
      </marker>
      <marker
        id={ARROW_MARKER_ACTIVE_ID}
        viewBox="0 0 10 10"
        refX="9"
        refY="5"
        markerWidth="6"
        markerHeight="6"
        orient="auto-start-reverse"
      >
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--edge-active)" />
      </marker>
    </defs>
  );
}

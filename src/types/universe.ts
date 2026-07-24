export type DomainId = string;
export type FieldId = string;
export type ConstellationId = string;
export type NodeId = string;
export type RelationTypeId = string;

export type NodeClass = "ordinary_field" | "bridge_field";
export type NodeKind = "domain" | "field" | "constellation";

export type PositionConfidence = "low" | "medium" | "high";

export interface ConceptualPosition {
  abstract_to_concrete: number;
  machine_to_human: number;
  confidence: PositionConfidence;
}

export interface VenueSet {
  journals: string[];
  conferences: string[];
}

export interface Book {
  title: string;
  authors: string[];
  level: string;
  coverage_note: string;
}

export interface FieldDisplayConfig {
  priority: number;
  default_label_visibility: string;
  show_edges: string;
}

export interface ConstellationDisplayConfig {
  default_visibility: string;
  reveal_on: string[];
  marker: string;
}

export interface DomainRegion {
  center: { x: number; y: number };
  radius_x: number;
  radius_y: number;
}

export interface Domain {
  id: DomainId;
  name: string;
  short_name: string;
  color: string;
  summary: string;
  region: DomainRegion;
  display_order: number;
  field_ids: FieldId[];
}

export interface FieldNode {
  id: FieldId;
  name: string;
  kind: "field";
  node_class: NodeClass;
  ordinary_child: boolean;
  domain_ids: DomainId[];
  primary_domain_id: DomainId;
  aliases: string[];
  position: ConceptualPosition;
  summary: string;
  representative_topics: string[];
  representative_venues: VenueSet;
  books: Book[];
  display: FieldDisplayConfig;
}

export interface ConstellationNode {
  id: ConstellationId;
  name: string;
  kind: "constellation";
  ordinary_child: false;
  constellation_type: string;
  domain_ids: DomainId[];
  component_field_ids: FieldId[];
  position: ConceptualPosition;
  summary: string;
  why_not_ordinary_child: string;
  representative_topics: string[];
  representative_venues: VenueSet;
  books: Book[];
  display: ConstellationDisplayConfig;
}

export type UniverseNode = FieldNode | ConstellationNode;

export interface RelationType {
  id: RelationTypeId;
  label: string;
  directed: boolean;
  description: string;
  style: {
    line: string;
    arrow: string;
    default_visibility: string;
  };
}

export interface Relation {
  source: NodeId;
  target: NodeId;
  type: RelationTypeId;
  strength: number;
}

export interface CoordinateAxis {
  name: string;
  minimum: number;
  maximum: number;
  definition: string;
  left_label?: string;
  right_label?: string;
  bottom_label?: string;
  top_label?: string;
}

export interface Metadata {
  title: string;
  subtitle: string;
  language: string;
  editorial_status: string;
  content_note: string;
  taxonomy_principles: string[];
  coordinate_system: {
    x: CoordinateAxis;
    y: CoordinateAxis;
  };
}

export interface ViewDefinition {
  id: string;
  name: string;
  purpose: string;
  layout: string;
  default_edges?: string;
  edge_behavior?: string;
  default_depth?: number;
  maximum_depth?: number;
}

export interface SemanticZoomStep {
  minimum_zoom: number;
  show: string[];
}

export interface VisualDesign {
  views: ViewDefinition[];
  domain_rendering: {
    render_as: string;
    show_centroid_marker: boolean;
    region_fill_opacity: number;
    region_border_opacity: number;
    label_style: string;
  };
  node_styles: {
    ordinary_field: {
      shape: string;
      radius_px: number;
      border_width_px: number;
      fill: string;
      border: string;
    };
    bridge_field: {
      shape: string;
      radius_px: number;
      border_width_px: number;
      fill: string;
      border: string;
    };
    constellation: {
      shape: string;
      radius_px: number;
      fill: string;
      border: string;
      default_visibility: string;
    };
    selected: {
      halo_radius_px: number;
      halo_opacity: number;
      pulse_once_ms: number;
    };
  };
  semantic_zoom: SemanticZoomStep[];
  interaction: {
    hover: string[];
    click: string[];
    search_select: string[];
    keyboard: Record<string, string>;
  };
  details_panel: {
    side: string;
    desktop_width_px: number;
    mobile_mode: string;
    sections: string[];
    default_expanded: string[];
  };
  filters: string[];
  search_index_fields: string[];
}

export interface UniverseData {
  schema_version: string;
  metadata: Metadata;
  visual_design: VisualDesign;
  relation_types: RelationType[];
  domains: Domain[];
  fields: FieldNode[];
  constellations: ConstellationNode[];
  relations: Relation[];
}

export type NodeClassFilter = "ordinary_field" | "bridge_field" | "constellation";

import { z } from "zod";

const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/, "must be a CSS hex color");
const coordinate = z.number().min(0).max(100);

const conceptualPositionSchema = z.object({
  abstract_to_concrete: coordinate,
  machine_to_human: coordinate,
  confidence: z.enum(["low", "medium", "high"]),
});

const venueSetSchema = z.object({
  journals: z.array(z.string()),
  conferences: z.array(z.string()),
});

const bookSchema = z.object({
  title: z.string(),
  authors: z.array(z.string()),
  level: z.string(),
  coverage_note: z.string(),
});

const fieldDisplaySchema = z.object({
  priority: z.number(),
  default_label_visibility: z.string(),
  show_edges: z.string(),
});

const constellationDisplaySchema = z.object({
  default_visibility: z.string(),
  reveal_on: z.array(z.string()),
  marker: z.string(),
});

const domainRegionSchema = z.object({
  center: z.object({ x: coordinate, y: coordinate }),
  radius_x: z.number().positive(),
  radius_y: z.number().positive(),
});

export const domainSchema = z.object({
  id: z.string(),
  name: z.string(),
  short_name: z.string(),
  color: hexColor,
  summary: z.string(),
  region: domainRegionSchema,
  display_order: z.number(),
  field_ids: z.array(z.string()),
});

export const fieldSchema = z.object({
  id: z.string(),
  name: z.string(),
  kind: z.literal("field"),
  node_class: z.enum(["ordinary_field", "bridge_field"]),
  ordinary_child: z.boolean(),
  domain_ids: z.array(z.string()).min(1),
  primary_domain_id: z.string(),
  aliases: z.array(z.string()),
  position: conceptualPositionSchema,
  summary: z.string(),
  representative_topics: z.array(z.string()),
  representative_venues: venueSetSchema,
  books: z.array(bookSchema),
  display: fieldDisplaySchema,
});

export const constellationSchema = z.object({
  id: z.string(),
  name: z.string(),
  kind: z.literal("constellation"),
  ordinary_child: z.literal(false),
  constellation_type: z.string(),
  domain_ids: z.array(z.string()).min(1),
  component_field_ids: z.array(z.string()).min(1),
  position: conceptualPositionSchema,
  summary: z.string(),
  why_not_ordinary_child: z.string(),
  representative_topics: z.array(z.string()),
  representative_venues: venueSetSchema,
  books: z.array(bookSchema),
  display: constellationDisplaySchema,
});

export const relationTypeSchema = z.object({
  id: z.string(),
  label: z.string(),
  directed: z.boolean(),
  description: z.string(),
  style: z.object({
    line: z.string(),
    arrow: z.string(),
    default_visibility: z.string(),
  }),
});

export const relationSchema = z.object({
  source: z.string(),
  target: z.string(),
  type: z.string(),
  strength: z.number().min(0).max(1),
});

const coordinateAxisSchema = z.object({
  name: z.string(),
  minimum: z.number(),
  maximum: z.number(),
  definition: z.string(),
  left_label: z.string().optional(),
  right_label: z.string().optional(),
  bottom_label: z.string().optional(),
  top_label: z.string().optional(),
});

export const metadataSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  language: z.string(),
  editorial_status: z.string(),
  content_note: z.string(),
  taxonomy_principles: z.array(z.string()),
  coordinate_system: z.object({
    x: coordinateAxisSchema,
    y: coordinateAxisSchema,
  }),
});

const viewDefinitionSchema = z.object({
  id: z.string(),
  name: z.string(),
  purpose: z.string(),
  layout: z.string(),
  default_edges: z.string().optional(),
  edge_behavior: z.string().optional(),
  default_depth: z.number().optional(),
  maximum_depth: z.number().optional(),
});

const semanticZoomStepSchema = z.object({
  minimum_zoom: z.number(),
  show: z.array(z.string()),
});

export const visualDesignSchema = z.object({
  views: z.array(viewDefinitionSchema),
  domain_rendering: z.object({
    render_as: z.string(),
    show_centroid_marker: z.boolean(),
    region_fill_opacity: z.number(),
    region_border_opacity: z.number(),
    label_style: z.string(),
  }),
  node_styles: z.object({
    ordinary_field: z.object({
      shape: z.string(),
      radius_px: z.number(),
      border_width_px: z.number(),
      fill: z.string(),
      border: z.string(),
    }),
    bridge_field: z.object({
      shape: z.string(),
      radius_px: z.number(),
      border_width_px: z.number(),
      fill: z.string(),
      border: z.string(),
    }),
    constellation: z.object({
      shape: z.string(),
      radius_px: z.number(),
      fill: z.string(),
      border: z.string(),
      default_visibility: z.string(),
    }),
    selected: z.object({
      halo_radius_px: z.number(),
      halo_opacity: z.number(),
      pulse_once_ms: z.number(),
    }),
  }),
  semantic_zoom: z.array(semanticZoomStepSchema),
  interaction: z.object({
    hover: z.array(z.string()),
    click: z.array(z.string()),
    search_select: z.array(z.string()),
    keyboard: z.record(z.string(), z.string()),
  }),
  details_panel: z.object({
    side: z.string(),
    desktop_width_px: z.number(),
    mobile_mode: z.string(),
    sections: z.array(z.string()),
    default_expanded: z.array(z.string()),
  }),
  filters: z.array(z.string()),
  search_index_fields: z.array(z.string()),
});

export const universeDataSchema = z.object({
  schema_version: z.string(),
  metadata: metadataSchema,
  visual_design: visualDesignSchema,
  relation_types: z.array(relationTypeSchema),
  domains: z.array(domainSchema),
  fields: z.array(fieldSchema),
  constellations: z.array(constellationSchema),
  relations: z.array(relationSchema),
});

export type UniverseDataParsed = z.infer<typeof universeDataSchema>;

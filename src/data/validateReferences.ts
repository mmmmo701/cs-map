import type { UniverseDataParsed } from "./schema";

export const SUPPORTED_MAJOR_VERSIONS = [2];

export interface ReferenceValidationResult {
  errors: string[];
  warnings: string[];
}

export function validateReferences(data: UniverseDataParsed): ReferenceValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const majorVersion = Number(data.schema_version.split(".")[0]);
  if (!SUPPORTED_MAJOR_VERSIONS.includes(majorVersion)) {
    errors.push(
      `Unsupported schema_version "${data.schema_version}". Supported major versions: ${SUPPORTED_MAJOR_VERSIONS.join(", ")}.`,
    );
  }

  const domainIds = new Set(data.domains.map((d) => d.id));
  const fieldIds = new Set(data.fields.map((f) => f.id));
  const constellationIds = new Set(data.constellations.map((c) => c.id));
  const relationTypeIds = new Set(data.relation_types.map((rt) => rt.id));

  const allIds = [...domainIds, ...fieldIds, ...constellationIds];
  const seen = new Set<string>();
  for (const id of allIds) {
    if (seen.has(id)) {
      errors.push(`Duplicate ID "${id}" across domains, fields, and constellations.`);
    }
    seen.add(id);
  }

  for (const domain of data.domains) {
    for (const fieldId of domain.field_ids) {
      if (!fieldIds.has(fieldId)) {
        errors.push(`Domain "${domain.id}" references unknown field "${fieldId}" in field_ids.`);
      }
    }
  }

  for (const field of data.fields) {
    for (const domainId of field.domain_ids) {
      if (!domainIds.has(domainId)) {
        errors.push(`Field "${field.id}" references unknown domain_id "${domainId}".`);
      }
    }
    if (!field.domain_ids.includes(field.primary_domain_id)) {
      errors.push(
        `Field "${field.id}" has primary_domain_id "${field.primary_domain_id}" not present in its domain_ids.`,
      );
    }
    const expectedOrdinary = field.node_class === "ordinary_field";
    if (field.ordinary_child !== expectedOrdinary) {
      errors.push(
        `Field "${field.id}" has node_class "${field.node_class}" but ordinary_child=${field.ordinary_child}.`,
      );
    }
    if (field.node_class === "bridge_field" && field.domain_ids.length < 2) {
      // Editorial content nuance rather than a structural error: a bridge field
      // should normally span 2+ domains, but the source JSON may not always
      // agree yet. Warn instead of failing the build.
      warnings.push(`Bridge field "${field.id}" belongs to only one domain (expected at least two).`);
    }
  }

  for (const constellation of data.constellations) {
    for (const domainId of constellation.domain_ids) {
      if (!domainIds.has(domainId)) {
        errors.push(`Constellation "${constellation.id}" references unknown domain_id "${domainId}".`);
      }
    }
    for (const componentId of constellation.component_field_ids) {
      if (!fieldIds.has(componentId)) {
        errors.push(
          `Constellation "${constellation.id}" references unknown component_field_id "${componentId}".`,
        );
      }
    }
  }

  const seenRelations = new Set<string>();
  for (const [index, relation] of data.relations.entries()) {
    const nodeExists = (id: string) => domainIds.has(id) || fieldIds.has(id) || constellationIds.has(id);
    if (!nodeExists(relation.source)) {
      errors.push(`Relation #${index} references unknown source "${relation.source}".`);
    }
    if (!nodeExists(relation.target)) {
      errors.push(`Relation #${index} references unknown target "${relation.target}".`);
    }
    if (!relationTypeIds.has(relation.type)) {
      errors.push(`Relation #${index} references unknown relation type "${relation.type}".`);
    }
    const key = `${relation.source}|${relation.target}|${relation.type}`;
    if (seenRelations.has(key)) {
      errors.push(`Duplicate relation: ${key}.`);
    }
    seenRelations.add(key);
  }

  return { errors, warnings };
}

export class DataValidationError extends Error {
  issues: string[];

  constructor(issues: string[]) {
    super(`Map data failed validation with ${issues.length} issue(s).`);
    this.name = "DataValidationError";
    this.issues = issues;
  }
}

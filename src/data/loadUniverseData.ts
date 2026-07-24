import { universeDataSchema } from "./schema";
import { DataValidationError, validateReferences } from "./validateReferences";
import type { UniverseData } from "../types/universe";

const DATA_URL = `${import.meta.env.BASE_URL}data/computer_science_universe_v2.json`;

export async function loadUniverseData(): Promise<UniverseData> {
  const response = await fetch(DATA_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch map data: ${response.status} ${response.statusText}`);
  }

  const raw = await response.json();
  const parseResult = universeDataSchema.safeParse(raw);
  if (!parseResult.success) {
    const issues = parseResult.error.issues.map(
      (issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`,
    );
    throw new DataValidationError(issues);
  }

  const { errors, warnings } = validateReferences(parseResult.data);
  if (warnings.length > 0 && import.meta.env.DEV) {
    console.warn(`Map data has ${warnings.length} warning(s):`, warnings);
  }
  if (errors.length > 0) {
    throw new DataValidationError(errors);
  }

  return parseResult.data as UniverseData;
}

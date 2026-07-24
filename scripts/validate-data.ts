import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { universeDataSchema } from "../src/data/schema";
import { validateReferences } from "../src/data/validateReferences";

const dataPath = fileURLToPath(
  new URL("../public/data/computer_science_universe_v2.json", import.meta.url),
);

const raw = JSON.parse(readFileSync(dataPath, "utf-8"));
const parseResult = universeDataSchema.safeParse(raw);

if (!parseResult.success) {
  console.error(`Schema validation failed with ${parseResult.error.issues.length} issue(s):`);
  for (const issue of parseResult.error.issues) {
    console.error(`  - ${issue.path.join(".") || "(root)"}: ${issue.message}`);
  }
  process.exit(1);
}

const { errors, warnings } = validateReferences(parseResult.data);
if (warnings.length > 0) {
  console.warn(`Reference validation found ${warnings.length} warning(s):`);
  for (const warning of warnings) {
    console.warn(`  - ${warning}`);
  }
}
if (errors.length > 0) {
  console.error(`Reference validation failed with ${errors.length} issue(s):`);
  for (const error of errors) {
    console.error(`  - ${error}`);
  }
  process.exit(1);
}

console.log("computer_science_universe_v2.json is valid.");
console.log(
  `  domains=${parseResult.data.domains.length} fields=${parseResult.data.fields.length} ` +
    `constellations=${parseResult.data.constellations.length} relations=${parseResult.data.relations.length}`,
);

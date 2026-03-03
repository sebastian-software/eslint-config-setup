/**
 * Serializes an OxLint config object to a JSON string.
 */
export function serializeOxlintConfig(config: unknown): string {
  return `${JSON.stringify(config, null, 2)  }\n`
}

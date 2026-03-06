export function renderTemplate(
  template: string,
  variables: Record<string, string>,
): string {
  let rendered = template

  for (const [key, value] of Object.entries(variables)) {
    rendered = rendered.replaceAll(`{{${key}}}`, value)
  }

  return rendered
}

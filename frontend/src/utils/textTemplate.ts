export function formatCountTemplate({
  template,
  count,
  formatNumber,
}: {
  template: string
  count: number
  formatNumber: (value: number) => string
}) {
  return template.replace('{count}', formatNumber(count))
}

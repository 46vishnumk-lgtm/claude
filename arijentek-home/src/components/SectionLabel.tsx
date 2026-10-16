/**
 * Numbered section label, in the homepage's bracket style:
 * [ 01 / Work ] in mono capitals, the number in orange.
 */
export function SectionLabel({ n, title }: { n: string; title: string }) {
  return (
    <p className="bracket min-h-0 text-[var(--fg-mute)]">
      <span className="text-[var(--orange-ink)]">{n}</span>
      <span aria-hidden="true">/</span>
      <span>{title}</span>
    </p>
  );
}

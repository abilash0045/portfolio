/** `text` with the first occurrence of `highlight` set in bold. */
export default function Highlighted({ text, highlight }: { text: string; highlight?: string }) {
  const at = highlight ? text.indexOf(highlight) : -1;
  if (!highlight || at < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, at)}
      <strong>{highlight}</strong>
      {text.slice(at + highlight.length)}
    </>
  );
}

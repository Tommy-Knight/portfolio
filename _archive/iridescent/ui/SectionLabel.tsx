export function SectionLabel({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 mb-12">
      <div className="w-8 h-px bg-accent/50" />
      <h2 className="font-mono text-xs uppercase tracking-widest text-accent">
        {text}
      </h2>
    </div>
  );
}

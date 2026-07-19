import Reveal from "./Reveal";

const tree = [
  {
    file: "security_detection.py",
    color: "#E5484D",
    desc: "Flags hardcoded credentials, insecure patterns, and other common vulnerabilities.",
  },
  {
    file: "quality_scoring.py",
    color: "#5B8DEF",
    desc: "Every scan rolls up into a single 0–100 quality score you can track over time.",
  },
  {
    file: "ai_suggestions.py",
    color: "#3DD68C",
    desc: "Each finding ships with a plain-language fix, not just a rule name.",
  },
  {
    file: "fast_analysis.py",
    color: "#F5A524",
    desc: "Full scans return in about a second — no build step, no waiting.",
  },
  {
    file: "editor.tsx",
    color: "#5B8DEF",
    desc: "Write or paste code straight into a Monaco-powered workspace, right in the browser.",
  },
  {
    file: "api.py",
    color: "#E5484D",
    desc: "Every scan runs through a FastAPI backend you can call from your own tools.",
    last: true,
  },
];

function Features() {
  return (
    <section className="max-w-7xl mx-auto px-8 py-20">
      <Reveal>
        <div className="max-w-2xl">
          <span className="font-dotted inline-block px-3 py-1.5 bg-[var(--surface-alt)] border border-[var(--border-color)] text-[#5B8DEF] rounded-md text-[10px]">
            capabilities
          </span>
          <h2 className="font-mono-display font-bold text-3xl md:text-4xl text-[var(--text-primary)] mt-5">
            Everything a first-pass review should catch.
          </h2>
          <p className="text-[var(--text-secondary)] mt-4 leading-7">
            CodeGuard AI runs the checks a senior reviewer would do first —
            before a human ever has to.
          </p>
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="mt-12 rounded-2xl overflow-hidden border border-[#262A33] bg-[var(--code-bg)] font-mono-display">
          <div className="flex items-center gap-2 px-5 py-3 border-b border-[#262A33] text-[#9AA0AA] text-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E5484D]"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#F5A524]"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#3DD68C]"></span>
            <span className="ml-3">src/features/</span>
          </div>

          {tree.map((item, i) => (
            <div
              key={item.file}
              className="group flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 px-5 py-4 border-b border-[#20242C] last:border-b-0 hover:bg-white/[0.03] transition-colors"
            >
              <span className="text-[#4B4F58] select-none shrink-0 w-6">
                {item.last ? "└──" : "├──"}
              </span>
              <span
                className="shrink-0 font-semibold"
                style={{ color: item.color }}
              >
                {item.file}
              </span>
              <span className="text-[#7B8090] text-sm sm:ml-4">{item.desc}</span>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

export default Features;
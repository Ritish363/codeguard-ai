import { ShieldCheck, Code2, Info, Github } from "lucide-react";

function Navbar() {
  return (
    <header className="sticky top-0 z-50">
      <div className="bg-[#14171C] text-[#9AA0AA] text-xs font-mono-display flex items-center justify-between px-5 py-1.5">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#E5484D]"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-[#F5A524]"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-[#3DD68C]"></span>
        </div>
        <p className="tracking-wide">codeguard-ai — main</p>
        <p className="hidden sm:block text-[#5B8DEF]">UTF-8 · LF · Python</p>
      </div>

      <div className="bg-[var(--surface)] border-b border-[var(--border-color)] h-16 px-8 flex items-center justify-between max-w-7xl mx-auto">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex items-center gap-3 text-left"
          aria-label="Scroll to top"
        >
          <div className="w-9 h-9 rounded-xl bg-[#14171C] flex items-center justify-center">
            <ShieldCheck size={18} className="text-[#3DD68C]" />
          </div>
          <div>
            <h1 className="font-mono-display font-bold text-lg text-[var(--text-primary)] leading-none">
              CodeGuard<span className="text-[#5B8DEF]">.ai</span>
            </h1>
            <p className="text-[11px] text-[var(--text-muted)] mt-1 font-mono-display">
              static_analysis · v1.0
            </p>
          </div>
        </button>

        <nav className="hidden md:flex items-center gap-1">
          <a
            href="#editor"
            className="flex items-center gap-2 px-4 py-1.5 rounded-t-lg border-b-2 border-transparent hover:border-[#5B8DEF] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition font-mono-display text-sm"
          >
            <Code2 size={16} />
            workspace.tsx
          </a>
          <a
            href="#about"
            className="flex items-center gap-2 px-4 py-1.5 rounded-t-lg border-b-2 border-transparent hover:border-[#5B8DEF] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition font-mono-display text-sm"
          >
            <Info size={16} />
            about.md
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="https://github.com/Ritish363/codeguard-ai"
            target="_blank"
            rel="noreferrer"
            className="w-9 h-9 rounded-xl border border-[var(--border-color)] flex items-center justify-center hover:bg-[var(--surface-alt)] transition text-[var(--text-primary)]"
            title="GitHub Repository"
          >
            <Github size={16} />
          </a>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
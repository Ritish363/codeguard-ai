import { GitBranch, Check } from "lucide-react";
import Reveal from "./Reveal";

function Footer() {
  return (
    <footer className="bg-[#0B0D11] font-mono-display">
      <Reveal>
        <div className="overflow-hidden text-center py-10 px-4 border-t border-[#20242C]">
          <span className="wordmark">CodeGuard.ai</span>
        </div>
      </Reveal>

      <div className="bg-[#14171C] text-[#9AA0AA] text-xs">
        <div className="max-w-7xl mx-auto px-8 py-3 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1.5 text-[#3DD68C]">
              <GitBranch size={14} />
              main
            </span>
            <span className="flex items-center gap-1.5">
              <Check size={14} className="text-[#3DD68C]" />
              no errors
            </span>
          </div>

          <p className="text-[#6B6F68]">
            © 2026 CodeGuard AI — built with Python, FastAPI &amp; React
          </p>

          <div className="hidden sm:flex items-center gap-5">
            <span>UTF-8</span>
            <span>LF</span>
            <span>Ln 1, Col 1</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
import { useState, memo } from "react";
import { motion } from "framer-motion";
import { Copy, Check } from "lucide-react";

const severityMeta = {
  High: {
    label: "error",
    color: "#E5484D",
  },
  Medium: {
    label: "warn",
    color: "#B8790A",
  },
  Low: {
    label: "note",
    color: "#3DD68C",
  },
};

const categoryMap = {
  CG001: "Security",
  CG002: "Reliability",
  CG003: "Performance",
  CG004: "Security",
  CG005: "Maintainability",
  CG006: "Security",
  CG007: "Security",
  CG008: "Security",
  CG009: "Maintainability",
  CG010: "Code Quality",
  CG011: "Security",
  CG012: "Security",
  CG013: "Security",
  CG014: "Security",
  CG015: "Reliability",
  CG016: "Security",
  CG017: "Security",
  CG018: "Reliability",
  CG019: "Maintainability",
  CG020: "Maintainability",
  CG021: "Code Quality",
  CG022: "Code Quality",
  CG023: "Maintainability",
  CG024: "Code Quality",
  CG025: "Reliability",
  CG026: "Maintainability",
};

function copyToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text);
  }
  // Fallback for older/insecure contexts
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
  return Promise.resolve();
}

const FindingCard = memo(function FindingCard({ issue, index, isOpen, onToggle }) {
  const meta = severityMeta[issue.severity] || { label: "note", color: "#3DD68C" };
  const [copied, setCopied] = useState(false);

  const fixText = issue.example_fix || issue.suggestion || "";

  const handleCopyFix = (e) => {
    e.stopPropagation();
    if (!fixText) return;
    copyToClipboard(fixText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.4) }}
      onClick={onToggle}
      className="mb-4 rounded-xl overflow-hidden border border-[#262A33] bg-[var(--code-bg)] shadow-lg cursor-pointer transition-colors duration-300 hover:border-[#5B8DEF]"
    >
      {/* Header */}
      <div className="flex justify-between items-center px-5 py-3.5 border-b border-[#262A33]">
        <div className="flex items-center gap-3 flex-wrap">
          <span
            className="px-2 py-1 rounded text-xs font-bold"
            style={{ color: meta.color, background: "rgba(255,255,255,0.06)" }}
          >
            {issue.rule || "CG000"}
          </span>

          <span className="text-xs font-semibold uppercase" style={{ color: meta.color }}>
            {meta.label}[{issue.severity.toLowerCase()}]
          </span>

          <span className="text-xs text-[#7F8797]">
            {categoryMap[issue.rule] || "General"}
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs text-[#7F8797]">
          <span>Line {issue.line || "-"}</span>
          <span className="text-lg leading-none">{isOpen ? "▾" : "▸"}</span>
        </div>
      </div>

      {/* Issue */}
      <div className="px-5 py-4 border-b border-[#262A33]">
        <p className="text-lg font-semibold text-white">{issue.issue}</p>
      </div>

      {isOpen && (
        <>
          {issue.code && (
            <div className="px-5 py-4 border-b border-[#262A33]">
              <p className="text-[#9AA0AA] text-xs uppercase tracking-wider mb-2">
                Code
              </p>
              <pre className="bg-[#11151C] border border-[#262A33] rounded-lg p-3 overflow-x-auto">
                <code className="text-[#8BD5FF] text-sm font-mono">{issue.code}</code>
              </pre>
            </div>
          )}

          <div className="px-5 py-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[#9AA0AA] text-xs uppercase tracking-wider">
                Recommendation
              </p>

              {fixText && (
                <button
                  onClick={handleCopyFix}
                  className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md border border-[#262A33] text-[#9AA0AA] hover:border-[#5B8DEF] hover:text-[#5B8DEF] transition-colors"
                >
                  {copied ? (
                    <>
                      <Check size={12} className="text-[#3DD68C]" />
                      <span className="text-[#3DD68C]">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy size={12} />
                      Copy Fix
                    </>
                  )}
                </button>
              )}
            </div>

            <p className="text-[#8FE0BC] leading-relaxed">{issue.suggestion}</p>
          </div>
        </>
      )}
    </motion.div>
  );
});

function Findings({ result }) {
  const [openIssue, setOpenIssue] = useState(null);

  return (
    <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border-color)] p-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="font-mono-display font-bold text-2xl text-[var(--text-primary)]">
          Analysis Findings
        </h2>

        <span className="bg-[var(--surface-alt)] rounded-full px-4 py-2 text-sm text-[var(--text-muted)] font-mono-display">
          {`${result.issues.length} issue${result.issues.length !== 1 ? "s" : ""}`}
        </span>
      </div>

      {result.issues.map((issue, index) => (
        <FindingCard
          key={index}
          issue={issue}
          index={index}
          isOpen={openIssue === index}
          onToggle={() => setOpenIssue(openIssue === index ? null : index)}
        />
      ))}
    </div>
  );
}

export default Findings;
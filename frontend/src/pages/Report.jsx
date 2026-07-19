import { useLocation, useNavigate, Link } from "react-router-dom";
import { useEffect } from "react";
import { ShieldCheck, ArrowLeft, FileJson, FileText } from "lucide-react";
import generatePDF from "../utils/pdfReport";
import { downloadJSON, downloadTXT } from "../utils/exportUtils";
import { toast, Toaster } from "../components/Toast";

const severityMeta = {
  High: { label: "error", color: "#E5484D" },
  Medium: { label: "warn", color: "#B8790A" },
  Low: { label: "note", color: "#3DD68C" },
};

function getRiskLevel(score) {
  if (score >= 80) {
    return { label: "Low Risk", color: "#3DD68C", bg: "var(--signal-green-bg)" };
  }
  if (score >= 60) {
    return { label: "Medium Risk", color: "#B8790A", bg: "var(--signal-amber-bg)" };
  }
  if (score >= 40) {
    return { label: "High Risk", color: "#E5484D", bg: "var(--signal-red-bg)" };
  }
  return { label: "Critical Risk", color: "#E5484D", bg: "var(--signal-red-bg)" };
}

function Report() {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state?.result;
  useEffect(() => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
    }, []);

  if (!result) {
    return (
      <div className="min-h-screen bg-[var(--canvas)] flex flex-col items-center justify-center px-6 font-mono-display text-center gap-6">
        <p className="text-[var(--text-secondary)]">
          No analysis found. Run a scan on the home page first.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-[#5B8DEF] hover:bg-[#4677DE] transition text-white px-5 py-2.5 rounded-xl font-semibold text-sm"
        >
          <ArrowLeft size={16} />
          Back to Home
        </Link>
      </div>
    );
  }

    const risk = getRiskLevel(result.score);
    const generatedAt = new Date().toLocaleString();

    const recommendations = [
  ...new Set(result.issues.map((issue) => issue.suggestion).filter(Boolean)),
    ];

    const handleDownloadPDF = () => {
      generatePDF(result);
      toast.success("PDF downloaded");
    };

    const handleDownloadJSON = () => {
      downloadJSON(result);
      toast.success("JSON downloaded");
    };

    const handleDownloadTXT = () => {
      downloadTXT(result);
      toast.success("TXT downloaded");
    };

  return (
    <div className="min-h-screen bg-[var(--canvas)] font-mono-display">
      {/* Header */}
      <div className="bg-[var(--surface)] border-b border-[var(--border-color)]">
        <div className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between flex-wrap gap-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#14171C] flex items-center justify-center">
                <ShieldCheck size={20} className="text-[#3DD68C]" />
            </div>

            <div>
                <h1 className="font-bold text-lg text-[var(--text-primary)] leading-none">
                CodeGuard<span className="text-[#5B8DEF]">.ai</span>
                </h1>

                <p className="text-xs text-[var(--text-muted)] mt-1">
                Predictive Code Review Report
                </p>
            </div>
            </Link>

                <div className="flex items-center gap-3 flex-wrap">
                    <p className="text-xs text-[var(--text-muted)]">
                        {generatedAt}
                    </p>

                    <button
                        onClick={() => navigate("/")}
                        className="px-4 py-2 rounded-lg border border-[var(--border-color)] hover:bg-[#1B2330] text-sm"
                    >
                        ← Home
                    </button>

                    <button
                        onClick={() => window.print()}
                        className="px-4 py-2 rounded-lg border border-[var(--border-color)] hover:bg-[#1B2330] text-sm"
                    >
                        🖨 Print
                    </button>

                    <button
                        onClick={handleDownloadJSON}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[var(--border-color)] hover:bg-[#1B2330] text-sm"
                    >
                        <FileJson size={14} />
                        JSON
                    </button>

                    <button
                        onClick={handleDownloadTXT}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[var(--border-color)] hover:bg-[#1B2330] text-sm"
                    >
                        <FileText size={14} />
                        TXT
                    </button>

                    <button
                        onClick={handleDownloadPDF}
                        className="bg-[#5B8DEF] hover:bg-[#4677DE] text-white px-5 py-2 rounded-lg text-sm font-semibold"
                    >
                        📄 Download PDF
                    </button>
                </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-10 space-y-10">
        {/* Score / Grade / Risk */}
        <div className="grid md:grid-cols-3 gap-5">
          <div className="bg-[var(--code-bg)] rounded-2xl border border-[#262A33] p-8 text-white">
            <p className="uppercase tracking-widest text-[#5B8DEF] text-xs">
              overall_quality_score
            </p>
            <h1 className="text-6xl font-extrabold mt-4">
              {result.score}
              <span className="text-xl text-[#6B6F68]">/100</span>
            </h1>
          </div>

          <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border-color)] p-8">
            <p className="uppercase tracking-widest text-[var(--text-muted)] text-xs">
              grade
            </p>
            <h1 className="text-6xl font-extrabold mt-4 text-[var(--text-primary)]">
              {result.grade}
            </h1>
          </div>

          <div
            className="rounded-2xl border border-[var(--border-color)] p-8"
            style={{ background: risk.bg }}
          >
            <p className="uppercase tracking-widest text-xs" style={{ color: risk.color }}>
              risk level
            </p>
            <h1 className="text-3xl font-extrabold mt-4" style={{ color: risk.color }}>
              {risk.label}
            </h1>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border-color)] p-8">
          <h2 className="font-bold text-xl text-[var(--text-primary)] mb-6">
            Executive Summary
          </h2>
            <p className="text-[var(--text-secondary)] leading-7 mb-8">
                This report summarizes the results of CodeGuard AI's static analysis of the
                submitted Python source code. A total of{" "}
                <span className="font-semibold text-[#5B8DEF]">
                    {result.rules_checked} rules
                </span>{" "}
                were evaluated, identifying{" "}
                <span className="font-semibold text-[#E5484D]">
                    {result.total_issues} issue{result.total_issues !== 1 ? "s" : ""}
                </span>
                . The project achieved an overall quality score of{" "}
                <span className="font-semibold text-[#3DD68C]">
                    {result.score}/100
                </span>{" "}
                (Grade {result.grade}), indicating{" "}
                <span className="font-semibold" style={{ color: risk.color }}>
                    {risk.label}
                </span>
                . Review the findings below before deploying the application to production.
            </p>

            <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border-color)] p-8">
                <h2 className="font-bold text-xl text-[var(--text-primary)] mb-6">
                    Overall Assessment
                </h2>

                <div className="space-y-4 text-[var(--text-secondary)] leading-7">

                    <div className="flex gap-3">
                    <span className="text-[#3DD68C]">✓</span>
                    <p>
                        Overall code quality score is
                        <span className="font-semibold text-[#3DD68C]">
                        {" "} {result.score}/100
                        </span>.
                    </p>
                    </div>

                    <div className="flex gap-3">
                    <span className="text-[#3DD68C]">✓</span>
                    <p>
                        Total issues detected:
                        <span className="font-semibold text-[#5B8DEF]">
                        {" "} {result.total_issues}
                        </span>.
                    </p>
                    </div>

                    <div className="flex gap-3">
                    <span className="text-[#E5484D]">⚠</span>
                    <p>
                        High severity findings should be resolved before production deployment.
                    </p>
                    </div>

                    <div className="flex gap-3">
                    <span className="text-[#3DD68C]">✓</span>
                    <p>
                        CodeGuard AI recommends reviewing all findings to improve security,
                        reliability and maintainability.
                    </p>
                    </div>

                </div>
            </div>

          <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            <div>
              <p className="text-xs uppercase tracking-widest text-[#5B8DEF]">Rules Checked</p>
              <h2 className="text-2xl font-bold mt-2 text-[var(--text-primary)]">
                {result.rules_checked}
              </h2>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-[#5B8DEF]">Total Issues</p>
              <h2 className="text-2xl font-bold mt-2 text-[var(--text-primary)]">
                {result.total_issues}
              </h2>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-[#E5484D]">High</p>
              <h2 className="text-2xl font-bold mt-2 text-[var(--text-primary)]">
                {result.high}
              </h2>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-[#B8790A]">Medium</p>
              <h2 className="text-2xl font-bold mt-2 text-[var(--text-primary)]">
                {result.medium}
              </h2>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-[#3DD68C]">Low</p>
              <h2 className="text-2xl font-bold mt-2 text-[var(--text-primary)]">
                {result.low}
              </h2>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-[#5B8DEF]">Analysis Time</p>
              <h2 className="text-2xl font-bold mt-2 text-[var(--text-primary)]">
                {result.analysis_time}s
              </h2>
            </div>
          </div>
        </div>

        {/* Detailed Findings */}
        <div>
          <h2 className="font-bold text-xl text-[var(--text-primary)] mb-6">
            Detailed Security Findings
          </h2>

          <div className="space-y-4">
            {result.issues.map((issue, index) => {
              const meta = severityMeta[issue.severity] || {
                label: "note",
                color: "#3DD68C",
              };

              return (
                <div
                  key={index}
                  className="rounded-xl overflow-hidden border border-[#262A33] bg-[var(--code-bg)]"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 border-b border-[#262A33]">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span
                        className="px-2 py-1 rounded text-xs font-bold"
                        style={{ color: meta.color, background: "rgba(255,255,255,0.06)" }}
                      >
                        {issue.rule || "CG000"}
                      </span>
                      <span
                        className="text-xs font-semibold uppercase"
                        style={{ color: meta.color }}
                      >
                        {meta.label}[{issue.severity.toLowerCase()}]
                      </span>
                    </div>
                    <span className="text-xs text-[#7F8797]">Line {issue.line || "-"}</span>
                  </div>

                  <div className="px-5 py-4 border-b border-[#262A33]">

                    <div className="flex items-center justify-between flex-wrap gap-3">

                      <h3 className="text-2xl font-bold text-white">
                        {issue.issue}
                      </h3>

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          issue.severity === "High"
                            ? "bg-red-500/20 text-red-400"
                            : issue.severity === "Medium"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-green-500/20 text-green-400"
                        }`}
                      >
                        {issue.severity.toUpperCase()}
                      </span>

                    </div>

                  </div>

                  {issue.code && (
                    <div className="px-5 py-4 border-b border-[#262A33]">
                      <p className="text-[#9AA0AA] text-xs uppercase tracking-wider mb-2">
                        Affected Code
                      </p>
                      <pre className="bg-[#11151C] border border-[#262A33] rounded-lg p-3 overflow-x-auto">
                        <code className="text-[#8BD5FF] text-sm font-mono">{issue.code}</code>
                      </pre>
                    </div>
                  )}

                  <div className="px-5 py-4">
                   {issue.why && (
                    <div className="px-5 py-4 border-b border-[#262A33]">
                        <p className="text-[#9AA0AA] text-xs uppercase tracking-wider mb-2">
                        Security Impact
                        </p>

                        <p className="text-[var(--text-secondary)] leading-7">
                        {issue.why}
                        </p>
                    </div>
                    )}
                    <p className="text-[#9AA0AA] text-xs uppercase tracking-wider mb-2">
                      Recommendation Fix
                    </p>

                    {issue.example_fix && (
                        <div className="px-5 py-4">
                            <p className="text-[#9AA0AA] text-xs uppercase tracking-wider mb-2">
                            Suggested Implementation
                            </p>

                            <pre className="bg-[#0B0F14] border border-[#30363D] rounded-xl p-4 overflow-x-auto shadow-inner">
                            <code className="text-[#3DD68C] text-sm font-mono">
                                {issue.example_fix}
                            </code>
                            </pre>
                        </div>
                        )}
                    <p className="text-[#8FE0BC]">{issue.suggestion}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      {/* Project Recommendations */}
        <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border-color)] p-8">
          <h2 className="font-bold text-xl text-[var(--text-primary)] mb-5">
            Project Recommendations
          </h2>

          {recommendations.length === 0 ? (
            <p className="text-[var(--text-secondary)] text-sm">
              No outstanding recommendations — this project passed every check.
            </p>
          ) : (
            <ul className="space-y-3">
              {recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-3 text-[var(--text-secondary)] text-sm">
                  <span className="text-[#5B8DEF] mt-0.5">→</span>
                  {rec}
                </li>
              ))}
            </ul>
          )}
        </div>

         {/* Scan Information */}
          <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border-color)] p-8">
            <h2 className="font-bold text-xl text-[var(--text-primary)] mb-6">
              Scan Information
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">

              <div>
                <p className="text-xs uppercase tracking-widest text-[#5B8DEF]">
                  Engine
                </p>
                <h3 className="text-lg font-semibold mt-2">
                  CodeGuard AI v1.0
                </h3>
              </div>

              <div>
                <p className="text-xs uppercase tracking-widest text-[#5B8DEF]">
                  Language
                </p>
                <h3 className="text-lg font-semibold mt-2">
                  Python
                </h3>
              </div>

              <div>
                <p className="text-xs uppercase tracking-widest text-[#5B8DEF]">
                  Analysis Type
                </p>
                <h3 className="text-lg font-semibold mt-2">
                  Static Code Analysis
                </h3>
              </div>

              <div>
                <p className="text-xs uppercase tracking-widest text-[#5B8DEF]">
                  Rules Checked
                </p>
                <h3 className="text-lg font-semibold mt-2">
                  {result.rules_checked}
                </h3>
              </div>

              <div>
                <p className="text-xs uppercase tracking-widest text-[#5B8DEF]">
                  Generated
                </p>
                <h3 className="text-lg font-semibold mt-2">
                  {generatedAt}
                </h3>
              </div>

              <div>
                <p className="text-xs uppercase tracking-widest text-[#5B8DEF]">
                  Status
                </p>
                <h3
                  className="text-lg font-semibold mt-2"
                  style={{ color: risk.color }}
                >
                  {risk.label}
                </h3>
              </div>

            </div>
          </div>
         
          {/* Footer */}
            <footer className="text-center py-10 border-t border-[#262A33]">
              <p className="text-[#5B8DEF] font-semibold">
                Generated by CodeGuard AI
              </p>

              <p className="text-[#777] mt-2">
                React • FastAPI • Python
              </p>

              <p className="text-[#555] mt-2">
                © 2026 CodeGuard AI
              </p>
            </footer>

      </div>

      <Toaster />
    </div>
  );
}

export default Report;
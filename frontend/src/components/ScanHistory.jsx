import { motion } from "framer-motion";
import { Clock, Trash2 } from "lucide-react";

const STORAGE_KEY = "codeguard_scan_history";
const MAX_ENTRIES = 5;

export function getScanHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveScanToHistory(result) {
  const entry = {
    id: `${Date.now()}`,
    score: result.score,
    grade: result.grade,
    high: result.high,
    medium: result.medium,
    low: result.low,
    total_issues: result.total_issues,
    timestamp: new Date().toISOString(),
  };

  const updated = [entry, ...getScanHistory()].slice(0, MAX_ENTRIES);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // localStorage unavailable (e.g. private browsing) — history is a
    // non-critical enhancement, fail silently.
  }

  return updated;
}

export function clearScanHistory() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
  return [];
}

function scoreColor(score) {
  if (score >= 80) return "#3DD68C";
  if (score >= 60) return "#B8790A";
  return "#E5484D";
}

function timeAgo(iso) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function ScanHistory({ history, onClear }) {
  if (!history || history.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface)] px-5 py-4 font-mono-display"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
          <Clock size={14} />
          <span>Recent Scans</span>
        </div>

        {onClear && (
          <button
            onClick={onClear}
            className="flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[#E5484D] transition"
          >
            <Trash2 size={12} />
            Clear
          </button>
        )}
      </div>

      <div className="flex gap-3 overflow-x-auto pb-1">
        {history.map((entry) => (
          <div
            key={entry.id}
            className="shrink-0 min-w-[132px] rounded-xl border border-[#262A33] bg-[var(--code-bg)] px-4 py-3"
          >
            <p
              className="text-2xl font-bold"
              style={{ color: scoreColor(entry.score) }}
            >
              {entry.score}
              <span className="text-xs text-[#6B6F68] font-normal">/100</span>
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Grade {entry.grade} · {entry.total_issues} issue
              {entry.total_issues !== 1 ? "s" : ""}
            </p>
            <p className="text-[10px] text-[#4A4F5A] mt-1">
              {timeAgo(entry.timestamp)}
            </p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default ScanHistory;
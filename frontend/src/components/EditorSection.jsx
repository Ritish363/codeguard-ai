import Editor from "@monaco-editor/react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LoaderCircle, CheckCircle2, Circle } from "lucide-react";
import { toast } from "./Toast";

const STAGES = [
  "Parsing Python source...",
  "Building AST...",
  "Running security rules...",
  "Calculating security score...",
  "Generating report...",
];

const LOG_LINES = [
  "[INFO] Loading parser...",
  "[INFO] AST generated...",
  "[INFO] Running security rules...",
  "[PASS] CG001",
  "[PASS] CG002",
  "[WARN] Hardcoded Secret detected",
  "[PASS] CG004",
  "[PASS] CG005",
  "[WARN] Bare except clause detected",
  "[PASS] CG007",
  "[PASS] CG008",
  "[INFO] Compiling findings...",
  "[INFO] Finalizing security score...",
];

function logStyle(line) {
  if (line.startsWith("[WARN]")) return "text-[#F5A524]";
  if (line.startsWith("[PASS]")) return "text-[#3DD68C]";
  if (line.startsWith("[DONE]")) return "text-[#5B8DEF] font-semibold";
  return "text-[#7F8797]";
}

function AnalysisLoadingPanel({ stageIndex, progress, logs, completing }) {
  const logContainerRef = useRef(null);

  useEffect(() => {
    const el = logContainerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [logs]);

  return (
    <motion.div
      key="analysis-loading-panel"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className="overflow-hidden border-b border-[#262A33] bg-[#0D0F14]"
    >
      <div className="px-6 py-5 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2 text-[#5B8DEF] font-mono-display text-sm font-semibold">
          <LoaderCircle size={16} className="animate-spin" />
          CodeGuard AI — Static Analysis Engine
        </div>

        {/* Stage checklist */}
        <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2">
          {STAGES.map((stage, idx) => {
            const isDone = idx < stageIndex;
            const isActive = idx === stageIndex;

            return (
              <div
                key={stage}
                className="flex items-center gap-2 text-xs font-mono-display"
              >
                {isDone ? (
                  <CheckCircle2 size={14} className="text-[#3DD68C] shrink-0" />
                ) : isActive ? (
                  <motion.span
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.1, repeat: Infinity }}
                    className="shrink-0"
                  >
                    <Circle size={14} className="text-[#5B8DEF]" />
                  </motion.span>
                ) : (
                  <Circle size={14} className="text-[#2A2E38] shrink-0" />
                )}

                <span
                  className={
                    isDone
                      ? "text-[#9AA0AA]"
                      : isActive
                      ? "text-[var(--text-primary)]"
                      : "text-[#4A4F5A]"
                  }
                >
                  {stage}
                </span>
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div>
          <div className="w-full h-2 rounded-full bg-[#1B1F27] overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-[#5B8DEF] to-[#3DD68C]"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            />
          </div>
          <div className="flex justify-between mt-1.5 text-[11px] text-[#7F8797] font-mono-display">
            <span>{completing ? "Analysis Complete" : STAGES[stageIndex]}</span>
            <span>{progress}%</span>
          </div>
        </div>

        {/* Terminal log */}
        <div
          ref={logContainerRef}
          className="bg-[#0A0C10] border border-[#1B1F27] rounded-lg p-3 h-28 overflow-y-auto font-mono text-[11px] leading-relaxed"
        >
          {logs.map((line, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className={logStyle(line)}
            >
              {line}
            </motion.p>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function EditorSection({ code, setCode, analyzeCode, loading }) {
  const [fileName, setFileName] = useState("main.py");
  const [dragActive, setDragActive] = useState(false);

  const [showPanel, setShowPanel] = useState(false);
  const [stageIndex, setStageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState([]);
  const [completing, setCompleting] = useState(false);

  const stageTimerRef = useRef(null);
  const logTimerRef = useRef(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (loading) {
      startedRef.current = true;
      setShowPanel(true);
      setCompleting(false);
      setStageIndex(0);
      setProgress(6);
      setLogs([]);

      let sIdx = 0;
      let lIdx = 0;
      const cappedStage = STAGES.length - 1; // hold at "Generating report..."
      const cappedProgress = 92; // leave headroom until backend actually responds

      stageTimerRef.current = setInterval(() => {
        sIdx = Math.min(sIdx + 1, cappedStage);
        setStageIndex(sIdx);
      }, 750);

      logTimerRef.current = setInterval(() => {
        if (lIdx < LOG_LINES.length) {
          setLogs((prev) => [...prev, LOG_LINES[lIdx]]);
          lIdx += 1;
        }
        setProgress((p) => Math.min(p + 5, cappedProgress));
      }, 380);

      return () => {
        clearInterval(stageTimerRef.current);
        clearInterval(logTimerRef.current);
      };
    }

    if (startedRef.current) {
      // Backend responded — snap the simulation to completion, then fade out.
      startedRef.current = false;
      clearInterval(stageTimerRef.current);
      clearInterval(logTimerRef.current);

      setCompleting(true);
      setStageIndex(STAGES.length);
      setProgress(100);
      setLogs((prev) => [
        ...prev,
        "[INFO] Report generated.",
        "[DONE] Analysis complete.",
      ]);

      const hideTimer = setTimeout(() => setShowPanel(false), 950);
      return () => clearTimeout(hideTimer);
    }

    return undefined;
  }, [loading]);

  const readFile = (file) => {
    if (!file || !file.name.endsWith(".py")) {
      toast.error("Please upload a Python (.py) file.");
      return;
    }

    setFileName(file.name);

    const reader = new FileReader();

    reader.onload = (e) => {
      setCode(e.target.result);
    };

    reader.readAsText(file);
  };

  const handleFileUpload = (e) => {
    if (loading) return;
    const file = e.target.files[0];
    readFile(file);
    e.target.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (loading) return;

    const file = e.dataTransfer.files[0];
    readFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (loading) return;
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    if (e.currentTarget.contains(e.relatedTarget)) return;
    setDragActive(false);
  };

  const loadSample = () => {
    if (loading) return;
    setFileName("sample.py");

    setCode(`password = "admin"

  while True:
      pass

  try:
      pass
  except:
      pass`);
    };

    const clearEditor = () => {
    if (loading) return;

    if (!window.confirm("Clear the editor?")) return;

    setCode("");
    setFileName("main.py");
    };

    useEffect(() => {
  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.code === "Enter" && !loading) {
      e.preventDefault();
      analyzeCode();
    }
  };

  document.addEventListener("keydown", handleKeyDown);

  return () => {
    document.removeEventListener("keydown", handleKeyDown);
  };
}, [loading, analyzeCode]);

  return (
    <div id="editor" className="space-y-4">
      <div className="flex items-baseline justify-between">
        <h2 className="font-mono-display font-bold text-2xl text-[var(--text-primary)]">
          Code Workspace
        </h2>

        <p className="text-sm text-[var(--text-muted)] font-mono-display">
          Write or paste your Python code below
        </p>
      </div>

      <div
        className={`rounded-2xl overflow-hidden shadow-xl bg-[var(--code-bg)] transition-all duration-300 ${
          dragActive
            ? "border-2 border-[#5B8DEF]"
            : "border border-[var(--border-color)]"
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {/* Header */}

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 px-6 py-4 bg-[var(--code-panel)] border-b border-[#262A33]">
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <span className="w-3 h-3 rounded-full bg-[#E5484D]"></span>
              <span className="w-3 h-3 rounded-full bg-[#F5A524]"></span>
              <span className="w-3 h-3 rounded-full bg-[#3DD68C]"></span>
            </div>

            <div className="h-8 w-px bg-[#262A33]"></div>

            <div className="px-4 py-2 rounded-lg bg-[#0F1115] border border-[#262A33]">
              <span className="text-slate-200 font-mono-display text-sm">
                {fileName}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-2 text-[#3DD68C] text-sm font-mono-display">
              <span className="w-2 h-2 rounded-full bg-[#3DD68C] animate-pulse"></span>
              Ready
            </span>

            <select
              disabled={loading}
              className="bg-[#0F1115] border border-[#262A33] text-slate-200 rounded-lg px-3 py-2 text-sm font-mono-display disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option>Python</option>
              <option disabled>Java</option>
              <option disabled>JavaScript</option>
            </select>

            <button
              onClick={analyzeCode}
              disabled={loading}
              className="inline-flex items-center gap-2 bg-[#5B8DEF] hover:bg-[#4677DE] text-white px-3 sm:px-5 py-2 rounded-xl font-mono-display font-semibold text-xs sm:text-sm transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"            >
              {loading ? (
                <>
                  <LoaderCircle size={18} className="animate-spin" />
                  Running AI Analysis...
                </>
              ) : (
                <>
                  ▶ Analyze Code
                </>
              )}
            </button>
          </div>
        </div>

        {/* Toolbar */}

        <div className="flex items-center gap-3 px-6 py-3 border-b border-[#262A33] bg-[#11151C]">
          <label
            htmlFor="python-upload"
            className={`text-sm px-4 py-2 rounded-lg border border-[#262A33] transition font-mono-display ${
              loading
                ? "opacity-50 cursor-not-allowed"
                : "cursor-pointer hover:border-[#5B8DEF]"
            }`}
          >
            📁 Upload
          </label>

          <input
            id="python-upload"
            type="file"
            accept=".py"
            disabled={loading}
            className="hidden"
            onChange={handleFileUpload}
          />

          <button
            onClick={loadSample}
            disabled={loading}
            className="text-sm px-4 py-2 rounded-lg border border-[#262A33] hover:border-[#3DD68C] transition font-mono-display disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-[#262A33]"
          >
            📋 Sample
          </button>

          <button
            onClick={clearEditor}
            disabled={loading}
            className="text-sm px-4 py-2 rounded-lg border border-[#262A33] hover:border-[#E5484D] transition font-mono-display disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-[#262A33]"
          >
            🗑 Clear
          </button>
        </div>

        {/* Drag Message */}

        {dragActive && (
          <div className="bg-[#152038] border-y border-[#5B8DEF] text-[#5B8DEF] text-center py-3 font-mono-display text-sm">
            📂 Drop your Python file here...
          </div>
        )}

        {/* Animated analysis loading panel */}

        <AnimatePresence>
          {showPanel && (
            <AnalysisLoadingPanel
              stageIndex={stageIndex}
              progress={progress}
              logs={logs}
              completing={completing}
            />
          )}
        </AnimatePresence>

        {/* Monaco */}

        <Editor
          height="400px"
          defaultLanguage="python"
          theme="vs-dark"
          value={code}
          onChange={(value) => setCode(value || "")}
          options={{
            readOnly: loading,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontSize: 15,
            fontFamily: "JetBrains Mono, monospace",
            padding: { top: 20 },
            mouseWheelZoom: false,

            scrollbar: {
              vertical: "visible",
              horizontal: "visible",
              verticalScrollbarSize: 12,
              horizontalScrollbarSize: 12,
              alwaysConsumeMouseWheel: false,
            },
          }}
        />
      </div>

      <div className="flex justify-between text-[var(--text-muted)] text-xs font-mono-display px-1">
        <div className="flex gap-6">
          <p>chars: {code.length}</p>
          <p>lines: {code ? code.split("\n").length : 0}</p>
        </div>

        <p>codeguard-ai</p>
      </div>
    </div>
  );
}

export default EditorSection;
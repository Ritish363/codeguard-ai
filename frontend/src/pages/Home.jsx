import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import EditorSection from "../components/EditorSection";
import Stats from "../components/Stats";
import Findings from "../components/Findings";
import About from "../components/About";
import Footer from "../components/Footer";
import Features from "../components/Features";
import { FileCheck } from "lucide-react";
import { toast, Toaster } from "../components/Toast";
import ScanHistory, {
  getScanHistory,
  saveScanToHistory,
  clearScanHistory,
} from "../components/ScanHistory";

const SAMPLE_CODE = `password = "admin"

while True:
    pass

try:
    pass
except:
    pass`;

function Home() {
  const navigate = useNavigate();

  const [code, setCode] = useState(SAMPLE_CODE);

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState(() => getScanHistory());
  const resultsRef = useRef(null);

  useEffect(() => {
    if (result) {
      const timer = setTimeout(() => {
        resultsRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 1050);

      return () => clearTimeout(timer);
    }
  }, [result]);

  const analyzeCode = async () => {
  if (!code.trim()) {
    toast.error("Please enter some code before analyzing.");
    return;
  }

  setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        throw new Error("Server Error");
      }

      const data = await response.json();
      await new Promise((resolve) => setTimeout(resolve, 800));
      setResult(data);
      setHistory(saveScanToHistory(data));
      toast.success("Analysis completed");
    } catch (error) {
      console.error("Analysis failed:", error);

      setResult({
        score: 0,
        grade: "F",
        rules_checked: 26,
        total_issues: 1,
        high: 1,
        medium: 0,
        low: 0,
        analysis_time: "0.000",
        issues: [
          {
            rule: "CG000",
            severity: "High",
            line: "-",
            issue: "Backend Connection Failed",
            suggestion: "Check if FastAPI server is running.",
            code: "",
          },
        ],
      });
      toast.error("Backend connection failed");
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    setHistory(clearScanHistory());
  };

  const goToReport = () => {
    navigate("/report", { state: { result } });
  };

  return (
    <div className="min-h-screen bg-[var(--canvas)] flex flex-col">
      <Navbar />
      <Hero />
      <Features />

      <div className="max-w-7xl mx-auto px-8 py-8 space-y-10 flex-1 w-full">
        <EditorSection
          code={code}
          setCode={setCode}
          analyzeCode={analyzeCode}
          loading={loading}
        />

        {history.length > 0 && (
          <ScanHistory history={history} onClear={handleClearHistory} />
        )}

        <div ref={resultsRef} className="space-y-10 scroll-mt-24">
          {result && (
            <>
              <Stats result={result} />
              <Findings result={result} />

              <div className="flex justify-center">
                <button
                  onClick={goToReport}
                  className="
                    inline-flex items-center gap-2
                    px-7 py-3.5
                    rounded-xl
                    bg-[#1E293B]
                    hover:bg-[#334155]
                    border border-[#334155]
                    hover:border-[#475569]
                    text-white
                    font-semibold
                    text-sm
                    transition-colors duration-200
                  "
                >
                  <FileCheck size={18} />
                  Generate Audit Report
                </button>
              </div>
            </>
          )}
        </div>

        <About />
      </div>

      <Footer />
      <Toaster />
    </div>
  );
}

export default Home;
import { useEffect, useState, memo } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ShieldAlert,
  TriangleAlert,
  CircleCheck,
} from "lucide-react";

// Counts a number up from 0 to `target` using requestAnimationFrame.
// Lightweight, dependency-free, and re-runs only when the target changes.
function useCountUp(target, duration = 900) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let frame;
    let start = null;
    const safeTarget = Number.isFinite(target) ? target : 0;

    const step = (timestamp) => {
      if (start === null) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      setValue(Math.round(progress * safeTarget));
      if (progress < 1) frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return value;
}

const ScoreRing = memo(function ScoreRing({ score, size = 108, strokeWidth = 9 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const color = score >= 80 ? "#3DD68C" : score >= 60 ? "#B8790A" : "#E5484D";
  const animatedScore = useCountUp(score, 1000);

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#262A33"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{
            strokeDashoffset: circumference - (score / 100) * circumference,
          }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-1 h-1 opacity-0"></div>
      </div>
    </div>
  );
});

const RiskBar = memo(function RiskBar({ label, count, max, color, bg }) {
  const animatedCount = useCountUp(count, 800);
  const pct = max > 0 ? (count / max) * 100 : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5 text-sm font-mono-display">
        <span className="text-[var(--text-secondary)]">{label}</span>
        <span className="font-bold" style={{ color }}>
          {animatedCount}
        </span>
      </div>
      <div
        className="w-full h-3 rounded-full overflow-hidden"
        style={{ background: bg }}
      >
        <motion.div
        className="h-full rounded-full"
        style={{ background: color }}
        initial={{
          width: 0,
          opacity: 0,
        }}
        animate={{
          width: `${pct}%`,
          opacity: 1,
        }}
        transition={{
          duration: 1,
          ease: "easeInOut",
          delay: 0.2,
        }}
      />
      </div>
    </div>
  );
});

function Stats({ result }) {
  if (!result) return null;

  const { high, medium, low, score } = result;
  const animatedScore = useCountUp(score, 1000);
  const animatedHigh = useCountUp(high, 900);
  const animatedMedium = useCountUp(medium, 900);
  const animatedLow = useCountUp(low, 900);
  const animatedRules = useCountUp(result.rules_checked, 900);
  const animatedTotal = useCountUp(result.total_issues, 900);

  const maxSeverity = Math.max(high, medium, low, 1);

  return (
    <div>
      <h2 className="font-mono-display font-bold text-2xl text-[var(--text-primary)] mb-6">
        Analysis Overview
      </h2>

      <div className="grid lg:grid-cols-4 gap-5">
        <div className="lg:col-span-2 bg-[var(--code-bg)] rounded-2xl text-white border border-[#262A33] font-mono-display overflow-hidden">
          <div className="marquee-track w-full border-b border-[#20242C] py-1.5 bg-[#0C0E12]">
            <span className="marquee-track-inner text-[#2E323C] text-xs tracking-widest">
              &lt;----- &lt;----- &lt;----- &lt;----- &lt;----- &lt;----- &lt;----- &lt;----- &lt;----- &lt;----- &lt;----- &lt;----- &lt;----- &lt;-----
            </span>
          </div>

          <div className="p-8">
            <div className="flex items-start justify-between gap-6 flex-wrap">
              <div>
                <p className="uppercase tracking-widest text-[#5B8DEF] text-xs">
                  overall_quality_score
                </p>

                <h1 className="text-7xl font-extrabold mt-4">
                  {animatedScore}
                  <span className="text-2xl text-[#6B6F68]">/100</span>
                  <span className="ml-4 px-3 py-1 rounded-lg bg-[#1B2330] text-[#5B8DEF] text-base font-semibold">
                    Grade {result.grade}
                  </span>
                </h1>
              </div>

              <ScoreRing
                score={score}
                size={92}
                strokeWidth={8}
              />
            </div>

            <div className="mt-6 w-full h-3 rounded-full bg-[#262A33] overflow-hidden">
              <motion.div
              className="h-full rounded-full"
              style={{
                background:
                  score >= 80
                    ? "#3DD68C"
                    : score >= 60
                    ? "#B8790A"
                    : "#E5484D",  
              }}
              initial={{ width: 0 }}
              animate={{ width: `${score}%` }}
              transition={{ duration: 1 }}
            />
            </div>

            <p className="mt-4 text-sm text-[#9AA0AA]">
              {score >= 90
                ? "pass — excellent quality"
                : score >= 70
                ? "pass — good quality"
                : "fail — needs improvement"}
            </p>
          </div>
        </div>

        <div className="bg-[var(--signal-red-bg)] rounded-2xl p-6 border border-[var(--border-color)] font-mono-display">
          <p className="text-[#E5484D] font-semibold text-sm">error[severity: high]</p>
          <h1 className="text-5xl font-bold mt-3 text-[var(--text-primary)]">{animatedHigh}</h1>
          <p className="text-[var(--text-muted)] mt-2 text-sm">security issues</p>
        </div>

        <div className="bg-[var(--signal-amber-bg)] rounded-2xl p-6 border border-[var(--border-color)] font-mono-display">
          <p className="text-[#B8790A] font-semibold text-sm">warn[severity: medium]</p>
          <h1 className="text-5xl font-bold mt-3 text-[var(--text-primary)]">{animatedMedium}</h1>
          <p className="text-[var(--text-muted)] mt-2 text-sm">quality issues</p>
        </div>
      </div>

      {/* Risk Distribution */}

      <div className="mt-8">
        <div className="flex items-center gap-2 mb-6">
          <AlertTriangle size={18} className="text-[#B8790A]" />
          <h2 className="font-bold text-xl text-[var(--text-primary)] font-mono-display">
            Risk Distribution
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-5">

          {/* High */}

          <motion.div
            initial={{
              opacity: 0,
              y: 20,
              scale: 0.96,
            }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="rounded-xl border border-[#5A262A] bg-[#2A1315] p-5 min-h-[165px] flex flex-col"
          >
            <div className="flex items-center gap-2 text-[#E5484D]">
              <ShieldAlert size={18} />
              <span className="text-xs uppercase tracking-widest font-semibold">
                High
              </span>
            </div>

            <motion.h2
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: .15, type: "spring" }}
              className="text-6xl font-extrabold mt-5 text-white"
            >
              {animatedHigh}
            </motion.h2>

            <div className="mt-auto pt-5 h-1 rounded-full bg-[#311818] overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${(high / maxSeverity) * 100}%`,
                }}
                transition={{ duration: .8 }}
                className="h-full bg-[#E5484D]"
              />
            </div>

            <p className="mt-4 text-sm text-[#AFAFAF]">
              Critical security issues
            </p>
          </motion.div>

          {/* Medium */}

          <motion.div
            initial={{
              opacity: 0,
              y: 20,
              scale: 0.96,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            transition={{
              delay: 0.15,
              duration: 0.45,
              ease: "easeOut",
            }}
            className="rounded-xl border border-[#5D4816] bg-[#2A2111] p-5 min-h-[165px] flex flex-col"
          >

            <div className="flex items-center gap-2 text-[#B8790A]">
              <TriangleAlert size={18} />
              <span className="text-xs uppercase tracking-widest font-semibold">
                Medium
              </span>
            </div>

            <motion.h2
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: .3, type: "spring" }}
              className="text-6xl font-extrabold mt-5 text-white"
            >
              {animatedMedium}
            </motion.h2>

            <div className="mt-5 h-2 rounded-full bg-[#3D2A05] overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${(medium / maxSeverity) * 100}%`,
                }}
                transition={{ duration: .8 }}
                className="h-full bg-[#B8790A]"
              />
            </div>

            <p className="mt-4 text-sm text-[#AFAFAF]">
              Quality warnings
            </p>
          </motion.div>

          {/* Low */}

          <motion.div
            initial={{
              opacity: 0,
              y: 20,
              scale: 0.96,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            transition={{
              delay: 0.3,
              duration: 0.45,
              ease: "easeOut",
            }}
            className="rounded-xl border border-[#1F5B3D] bg-[#10271B] p-5 min-h-[165px] flex flex-col"
          >
            
            <div className="flex items-center gap-2 text-[#3DD68C]">
              <CircleCheck size={18} />
              <span className="text-xs uppercase tracking-widest font-semibold">
                Low
              </span>
            </div>

            <motion.h2
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: .45, type: "spring" }}
              className="text-6xl font-extrabold mt-5"
            >
              {animatedLow}
            </motion.h2>

            <div className="mt-auto pt-5 h-1 rounded-full overflow-hidden ...">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${(low / maxSeverity) * 100}%`,
                }}
                transition={{ duration: .8 }}
                className="h-full bg-[#3DD68C]"
              />
            </div>

            <p className="mt-4 text-sm text-[#AFAFAF]">
              Minor suggestions
            </p>
          </motion.div>

        </div>
      </div>

      <div className="mt-10 bg-[var(--code-bg)] rounded-2xl border border-[#262A33] px-6 pt-10 pb-6 font-mono-display">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <p className="text-xs uppercase tracking-widest text-[#5B8DEF]">
              Rules Checked
            </p>
            <h2 className="text-3xl font-bold mt-2">{animatedRules}</h2>
          </div>

          <div>
            <p className="text-xs uppercase tracking-widest text-[#5B8DEF]">
              Total Issues
            </p>
            <h2 className="text-3xl font-bold mt-2">{animatedTotal}</h2>
          </div>

          <div>
            <p className="text-xs uppercase tracking-widest text-[#5B8DEF]">
              Low Issues
            </p>
            <h2 className="text-3xl font-bold mt-2">{animatedLow}</h2>
          </div>

          <div>
            <p className="text-xs uppercase tracking-widest text-[#5B8DEF]">
              Analysis Time
            </p>
            <h2 className="text-3xl font-bold mt-2">
              {result.analysis_time} sec
            </h2>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Stats;
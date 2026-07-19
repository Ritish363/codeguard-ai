import { motion } from "framer-motion";
import { ArrowDown, Sparkles, ShieldCheck } from "lucide-react";

const findings = [
  { label: "hardcoded secret", angle: -35, radius: 115, color: "#E5484D" },
  { label: "infinite loop", angle: 55, radius: 135, color: "#F5A524" },
  { label: "bare except", angle: 165, radius: 115, color: "#F5A524" },
  { label: "no input checks", angle: -140, radius: 135, color: "#5B8DEF" },
];

const line1 = "Analyze Python code".split(" ");
const line2 = "before you deploy.".split(" ");

// Entire hero: fade-in + slide-up, plays once on load, then orchestrates
// the text column's staggered reveal (heading -> subtitle -> buttons).
const heroVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

// Text column: no visual change of its own, just staggers its children
// (badge, heading, warning line, subtitle, button row) in sequence.
const textColumnVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

// Buttons animate last, with their own short stagger between them.
const buttonRowVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.15 },
  },
};

const buttonItemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 160, damping: 14 },
  },
};

function AnimatedWords({ words, startDelay = 0 }) {
  return words.map((word, i) => (
    <span
      key={i}
      className="animate-word"
      style={{ animationDelay: `${startDelay + i * 0.07}s` }}
    >
      {word}
      {i < words.length - 1 ? "\u00A0" : ""}
    </span>
  ));
}

function Hero() {
  return (
    <section className="border-b border-[var(--border-color)] bg-[var(--canvas)] relative overflow-hidden">
      <div className="hero-glow absolute inset-x-0 top-0 h-[304px]"></div>
      <motion.div
        className="max-w-7xl mx-auto px-6 py-7 grid lg:grid-cols-[1.75rem_1fr_0.9fr] gap-3.5 items-center relative"
        variants={heroVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="hidden lg:flex flex-col items-end gap-1 pt-1 gutter-number select-none">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i}>{i + 1}</span>
          ))}
        </div>

        <motion.div variants={textColumnVariants}>
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-[var(--surface)] border border-[var(--border-color)] text-[#5B8DEF] text-[10px] font-mono-display"
          >
            <Sparkles size={11} />
            ai-powered static analysis
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="mt-3.5 text-[1.665rem] md:text-[2.43rem] font-mono-display font-extrabold leading-[1.08] text-[var(--text-primary)]"
          >
            <span className="block">
              <AnimatedWords words={line1} startDelay={0.1} />
            </span>
            <span className="diagnostic-underline inline-block">
              <AnimatedWords words={line2} startDelay={0.1 + line1.length * 0.07} />
            </span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="mt-1.5 font-mono-display text-[10px] text-[#E5484D]"
          >
            ^^^^^^^^^^^^^^^^^^^^^^^^^^&nbsp;
            <span className="text-[var(--text-muted)]">
              warning: 2 known risk patterns detected
            </span>
          </motion.p>

          <motion.p
            variants={itemVariants}
            className="mt-3.5 text-[12px] text-[var(--text-secondary)] leading-[1.4rem] max-w-x1"
          >
            Detect security vulnerabilities, code quality issues and
            best-practice violations using a fast static analysis engine
            built with Python, FastAPI and React.
          </motion.p>

          <motion.div
            variants={buttonRowVariants}
            className="mt-3.5 flex flex-wrap items-center gap-2"
          >
            <motion.button
              variants={buttonItemVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() =>
                document.getElementById("editor")?.scrollIntoView({ behavior: "smooth" })
              }
              className="inline-flex items-center gap-2 bg-[#14171C] hover:bg-[#0F1115] text-white px-3.5 py-1.5 rounded-xl font-mono-display font-semibold text-[12px] transition"
            >
              $ analyze main.py
              <ArrowDown size={13} />
            </motion.button>

            <motion.span
              variants={buttonItemVariants}
              className="font-mono-display text-[10px] text-[var(--text-muted)] px-2 py-1 rounded-lg border border-[var(--border-color)] bg-[var(--surface)]"
            >
              scan time ~1.2s
            </motion.span>
          </motion.div>
        </motion.div>

        {/* Scan radar */}
        <div className="relative w-full aspect-square max-w-[265px] mx-auto hidden md:block" aria-hidden="true">
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: "conic-gradient(from 0deg, rgba(91,141,239,0.35), rgba(91,141,239,0) 30%)",
              animation: "spin 4s linear infinite",
            }}
          ></div>

          <div className="absolute inset-[20px] rounded-full border border-dashed border-[var(--border-color)]"></div>
          <div className="absolute inset-[45px] rounded-full border border-dashed border-[var(--border-color)]"></div>
          <div className="absolute inset-[77px] rounded-full border border-[var(--border-color)]"></div>

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-[47px] h-[47px] rounded-2xl bg-[#14171C] flex items-center justify-center shadow-xl">
              <ShieldCheck size={20} className="text-[#3DD68C]" />
            </div>
          </div>

          {findings.map((f, i) => {
            const rad = (f.angle * Math.PI) / 180;
            const x = 50 + (f.radius / 3.8) * Math.cos(rad);
            const y = 50 + (f.radius / 3.8) * Math.sin(rad);
            return (
              <div
                key={i}
                className="absolute flex items-center gap-1.5"
                style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%, -50%)" }}
              >
                <span
                  className="w-[8px] h-[8px] rounded-full shrink-0"
                  style={{ background: f.color, boxShadow: `0 0 0 4px ${f.color}22` }}
                ></span>
                <span className="font-mono-display text-[8px] whitespace-nowrap px-[6px] py-[3px] rounded-md bg-[var(--surface)] border border-[var(--border-color)] text-[var(--text-secondary)]">
                  {f.label}
                </span>
              </div>
            );
          })}
        </div>
      </motion.div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (prefers-reduced-motion: reduce) {
          section [style*="animation"] { animation: none !important; }
        }
      `}</style>
    </section>
  );
}

export default Hero;
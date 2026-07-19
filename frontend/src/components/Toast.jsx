import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Info } from "lucide-react";

// Minimal singleton toast store — no provider/context wiring needed.
// Any component can call `toast.success/error/info(...)`, and any
// mounted <Toaster /> will pick it up.
let toastId = 0;
let toasts = [];
let listeners = [];

function emit() {
  listeners.forEach((listener) => listener([...toasts]));
}

function pushToast(type, message, duration = 3500) {
  const id = ++toastId;
  toasts = [...toasts, { id, type, message }];
  emit();

  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id);
    emit();
  }, duration);
}

export const toast = {
  success: (message) => pushToast("success", message),
  error: (message) => pushToast("error", message),
  info: (message) => pushToast("info", message),
};

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

const STYLES = {
  success: { fg: "#3DD68C", bg: "var(--signal-green-bg)" },
  error: { fg: "#E5484D", bg: "var(--signal-red-bg)" },
  info: { fg: "#5B8DEF", bg: "#1B2330" },
};

export function Toaster() {
  const [items, setItems] = useState(toasts);

  useEffect(() => {
    listeners.push(setItems);
    return () => {
      listeners = listeners.filter((l) => l !== setItems);
    };
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 font-mono-display pointer-events-none">
      <AnimatePresence>
        {items.map((t) => {
          const Icon = ICONS[t.type] || Info;
          const style = STYLES[t.type] || STYLES.info;

          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 14, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 30, scale: 0.96 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="pointer-events-auto flex items-center gap-3 pl-4 pr-5 py-3 rounded-xl border shadow-lg min-w-[260px] max-w-sm bg-[var(--surface)] border-[var(--border-color)]"
            >
              <span
                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: style.bg }}
              >
                <Icon size={16} style={{ color: style.fg }} />
              </span>
              <p className="text-sm text-[var(--text-primary)] leading-snug">
                {t.message}
              </p>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
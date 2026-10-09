"use client";

import { CircleCheck } from "lucide-react";
import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

interface Toast {
  id: number;
  message: string;
  detail?: string;
}

const ToastContext = createContext<(message: string, detail?: string) => void>(() => {});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((message: string, detail?: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, detail }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[70] flex flex-col items-center gap-2 px-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="glass-strong flex animate-scale-in items-center gap-3 rounded-full py-2.5 pr-5 pl-3 text-sm"
          >
            <CircleCheck size={18} className="shrink-0 text-emerald-500" />
            <span className="font-medium">{t.message}</span>
            {t.detail && <span className="hidden text-ink-muted sm:inline">{t.detail}</span>}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

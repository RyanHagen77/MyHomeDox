"use client";
import * as React from "react";

type ToastItem = { id: string; message: string };
const Ctx = React.createContext<{
  toasts: ToastItem[];
  push: (message: string) => void;
}>({ toasts: [], push: () => {} });

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);
  function push(message: string) {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
  }
  return (
    <Ctx.Provider value={{ toasts, push }}>
      {children}
      <div aria-live="polite" className="fixed bottom-4 right-4 space-y-2">
        {toasts.map((t) => (
          <div key={t.id} className="bg-text text-white px-3 py-2 rounded-md shadow-card">{t.message}</div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
export function useToast(){ return React.useContext(Ctx); }

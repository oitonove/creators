"use client";

import { useState } from "react";

export function CopyButton({ text, label = "Copiar" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard indisponível (http local, permissão negada) — ignora
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="cursor-pointer rounded-lg border border-white/20 px-2.5 py-1 text-[11px] font-medium text-white transition hover:bg-white/10"
    >
      {copied ? "Copiado!" : label}
    </button>
  );
}

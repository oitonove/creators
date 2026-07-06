// Portal do Criador — OITONOVE
import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Portal do Criador — OITONOVE",
  description: "Área do criador parceiro OITONOVE: cupom, vendas e comissões.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <div className="mx-auto min-h-screen max-w-3xl px-4 py-8 md:py-12">
          <header className="mb-10 flex items-center justify-between">
            <span className="text-[15px] font-semibold tracking-[-0.03em]">
              OITONOVE <span className="font-normal text-neutral-400">· criadores</span>
            </span>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}

// Erro genérico do portal (rede, CRM fora do ar, etc). 401 é tratado à parte
// nas páginas (redirect pro login) - isso aqui pega o resto.
"use client";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto max-w-sm">
      <h1 className="mb-2 text-[22px] font-semibold tracking-[-0.03em]">Algo deu errado</h1>
      <p className="mb-8 text-[13px] leading-relaxed text-neutral-500">
        Não conseguimos carregar o portal agora. Pode ser instabilidade temporária -
        tenta de novo em instantes.
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="cursor-pointer rounded-xl bg-neutral-900 px-4 py-3 text-[14px] font-medium text-white transition hover:bg-neutral-700"
      >
        Tentar de novo
      </button>
    </main>
  );
}

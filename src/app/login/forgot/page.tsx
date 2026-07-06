// /login/forgot — pede reset de senha (nova senha é enviada por email).
import { requestPasswordReset } from "@/lib/crm";
import { redirect } from "next/navigation";

export const metadata = { title: "Recuperar senha — Portal do Criador OITONOVE" };

async function forgot(formData: FormData) {
  "use server";
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (email) {
    try {
      await requestPasswordReset(email);
    } catch {
      // resposta é idêntica com ou sem sucesso — sem enumeração
    }
  }
  redirect("/login/forgot?enviado=1");
}

export default async function ForgotPage({
  searchParams,
}: {
  searchParams: Promise<{ enviado?: string }>;
}) {
  const sp = await searchParams;

  return (
    <main className="mx-auto max-w-sm">
      <h1 className="mb-2 text-[22px] font-semibold tracking-[-0.03em]">Recuperar senha</h1>
      <p className="mb-8 text-[13px] leading-relaxed text-neutral-500">
        Digite o email cadastrado no programa. Uma nova senha é gerada e enviada
        pra ele.
      </p>

      {sp.enviado ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-[13px] text-emerald-800">
          Se o email estiver cadastrado, uma nova senha foi enviada.
        </div>
      ) : (
        <form action={forgot} className="flex flex-col gap-3">
          <input
            type="email"
            name="email"
            required
            placeholder="seu@email.com"
            className="rounded-xl border border-neutral-200 bg-white px-4 py-3 text-[14px] placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-xl bg-neutral-900 px-4 py-3 text-[14px] font-medium text-white transition hover:bg-neutral-700"
          >
            Enviar nova senha
          </button>
        </form>
      )}

      <p className="mt-8 text-[12px] text-neutral-400">
        <a href="/login" className="underline">
          Voltar pro login
        </a>
      </p>
    </main>
  );
}

// /login/forgot - pede reset de senha (nova senha é enviada por email).
import { getMockCredentials, requestPasswordReset } from "@/lib/crm";
import { redirect } from "next/navigation";
import { SubmitButton } from "@/components/SubmitButton";

export const metadata = { title: "Recuperar senha - Portal do Criador OITONOVE" };

async function forgot(formData: FormData) {
  "use server";
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (email) {
    try {
      await requestPasswordReset(email);
    } catch {
      // resposta é idêntica com ou sem sucesso - sem enumeração
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
  const mock = getMockCredentials();

  return (
    <main className="mx-auto max-w-sm">
      <h1 className="mb-2 text-[22px] font-semibold tracking-[-0.03em]">Recuperar senha</h1>
      <p className="mb-8 text-[13px] leading-relaxed text-neutral-500">
        Digite o email cadastrado no programa. Uma nova senha é gerada e enviada
        pra ele.
      </p>

      {mock && (
        <div className="mb-4 rounded-xl border border-sky-200 bg-sky-50 p-4 text-[13px] text-sky-800">
          No modo local de teste, use a conta <strong>{mock.email}</strong> com a senha <strong>{mock.password}</strong>.
        </div>
      )}

      {sp.enviado ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-[13px] text-emerald-800">
          {mock
            ? "No modo local, a senha não muda automaticamente. Use as credenciais exibidas na tela de login."
            : "Se o email estiver cadastrado, uma nova senha foi enviada."}
        </div>
      ) : (
        <form action={forgot} className="flex flex-col gap-3">
          <input
            type="email"
            name="email"
            required
            defaultValue={mock?.email}
            placeholder="seu@email.com"
            className="rounded-xl border border-neutral-200 bg-white px-4 py-3 text-[14px] placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none"
          />
          <SubmitButton pendingLabel="Enviando…">Enviar nova senha</SubmitButton>
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

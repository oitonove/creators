// /login — pede o magic-link por email. Sem senha: acesso via link de uso
// único enviado ao email cadastrado no programa.
import { redirect } from "next/navigation";
import { requestMagicLink } from "@/lib/crm";

export const metadata = { title: "Entrar — Portal do Criador OITONOVE" };

async function requestLink(formData: FormData) {
  "use server";
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (email) {
    try {
      await requestMagicLink(email);
    } catch {
      // resposta é idêntica com ou sem sucesso — sem enumeração
    }
  }
  redirect("/login?enviado=1");
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ enviado?: string; erro?: string }>;
}) {
  const sp = await searchParams;

  return (
    <main className="mx-auto max-w-sm">
      <h1 className="mb-2 text-[22px] font-semibold tracking-[-0.03em]">Entrar no portal</h1>
      <p className="mb-8 text-[13px] leading-relaxed text-neutral-500">
        Digite o email cadastrado no programa de criadores. Você recebe um link
        de acesso — sem senha.
      </p>

      {sp.enviado ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-[13px] text-emerald-800">
          Se o email estiver cadastrado, o link de acesso foi enviado. Vale por
          15 minutos e só funciona uma vez.
        </div>
      ) : (
        <>
          {sp.erro && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-[13px] text-red-700">
              Link inválido, expirado ou já usado. Peça um novo abaixo.
            </div>
          )}
          <form action={requestLink} className="flex flex-col gap-3">
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
              Enviar link de acesso
            </button>
          </form>
        </>
      )}

      <p className="mt-8 text-[12px] text-neutral-400">
        Ainda não é parceiro?{" "}
        <a href="https://www.oitonove.com.br/criadores" className="underline">
          Candidate-se em oitonove.com.br/criadores
        </a>
      </p>
    </main>
  );
}

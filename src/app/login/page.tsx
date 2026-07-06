// /login — email + senha (enviada por email na aprovação / reset).
import { redirect } from "next/navigation";
import { loginWithPassword } from "@/lib/crm";
import { getSessionToken, setSessionToken } from "@/lib/session";

export const metadata = { title: "Entrar — Portal do Criador OITONOVE" };

async function login(formData: FormData) {
  "use server";
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  const sessionToken = email && password ? await loginWithPassword(email, password) : null;
  if (!sessionToken) redirect("/login?erro=1");

  await setSessionToken(sessionToken);
  redirect("/dashboard");
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const sp = await searchParams;
  if (await getSessionToken()) redirect("/dashboard");

  return (
    <main className="mx-auto max-w-sm">
      <h1 className="mb-2 text-[22px] font-semibold tracking-[-0.03em]">Entrar no portal</h1>
      <p className="mb-8 text-[13px] leading-relaxed text-neutral-500">
        Use o email e a senha enviados quando seu cadastro foi aprovado.
      </p>

      {sp.erro && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-[13px] text-red-700">
          Email ou senha inválidos.
        </div>
      )}
      <form action={login} className="flex flex-col gap-3">
        <input
          type="email"
          name="email"
          required
          placeholder="seu@email.com"
          className="rounded-xl border border-neutral-200 bg-white px-4 py-3 text-[14px] placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none"
        />
        <input
          type="password"
          name="password"
          required
          placeholder="Senha"
          className="rounded-xl border border-neutral-200 bg-white px-4 py-3 text-[14px] placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-xl bg-neutral-900 px-4 py-3 text-[14px] font-medium text-white transition hover:bg-neutral-700"
        >
          Entrar
        </button>
      </form>

      <p className="mt-4 text-[12px] text-neutral-400">
        <a href="/login/forgot" className="underline">
          Esqueci minha senha
        </a>
      </p>

      <p className="mt-8 text-[12px] text-neutral-400">
        Ainda não é parceiro?{" "}
        <a href="https://www.oitonove.com.br/criadores" className="underline">
          Candidate-se em oitonove.com.br/criadores
        </a>
      </p>
    </main>
  );
}

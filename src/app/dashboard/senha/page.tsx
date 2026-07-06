// /dashboard/senha — trocar senha (exige senha atual).
import { redirect } from "next/navigation";
import Link from "next/link";
import { changePassword, CrmError } from "@/lib/crm";
import { getSessionToken, setSessionToken } from "@/lib/session";
import { SubmitButton } from "@/components/SubmitButton";

export const metadata = { title: "Trocar senha — Portal do Criador OITONOVE" };

async function submit(formData: FormData) {
  "use server";
  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (newPassword !== confirmPassword) {
    redirect("/dashboard/senha?erro=" + encodeURIComponent("As senhas novas não coincidem."));
  }

  let newSessionToken: string;
  try {
    newSessionToken = await changePassword(currentPassword, newPassword);
  } catch (e) {
    const msg = e instanceof CrmError ? e.message : "Não deu pra trocar a senha. Tenta de novo.";
    redirect("/dashboard/senha?erro=" + encodeURIComponent(msg));
  }

  // CRM revoga o bearer antigo na troca — atualiza o cookie com o novo pra não deslogar.
  await setSessionToken(newSessionToken);
  redirect("/dashboard?senha=1");
}

export default async function ChangePasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const sp = await searchParams;
  if (!(await getSessionToken())) redirect("/login");

  return (
    <main className="mx-auto max-w-sm">
      <h1 className="mb-2 text-[22px] font-semibold tracking-[-0.03em]">Trocar senha</h1>
      <p className="mb-8 text-[13px] leading-relaxed text-neutral-500">
        Escolha uma senha nova de pelo menos 8 caracteres.
      </p>

      {sp.erro && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-[13px] text-red-700">
          {sp.erro}
        </div>
      )}

      <form action={submit} className="flex flex-col gap-3">
        <input
          type="password"
          name="currentPassword"
          required
          placeholder="Senha atual"
          className="rounded-xl border border-neutral-200 bg-white px-4 py-3 text-[14px] placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none"
        />
        <input
          type="password"
          name="newPassword"
          required
          minLength={8}
          placeholder="Nova senha"
          className="rounded-xl border border-neutral-200 bg-white px-4 py-3 text-[14px] placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none"
        />
        <input
          type="password"
          name="confirmPassword"
          required
          minLength={8}
          placeholder="Confirmar nova senha"
          className="rounded-xl border border-neutral-200 bg-white px-4 py-3 text-[14px] placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none"
        />
        <SubmitButton pendingLabel="Salvando…">Salvar nova senha</SubmitButton>
      </form>

      <p className="mt-8 text-[12px] text-neutral-400">
        <Link href="/dashboard" className="underline">
          Voltar pro painel
        </Link>
      </p>
    </main>
  );
}

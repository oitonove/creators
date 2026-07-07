import { getCreatorOnboarding } from "@/lib/crm";
import { OnboardingForm } from "./OnboardingForm";

export const metadata = {
  title: "Completar cadastro - Portal do Criador OITONOVE",
  robots: { index: false, follow: false },
};

export default async function CreatorOnboardingPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const creator = await getCreatorOnboarding(token);

  if (!creator) {
    return (
      <main className="mx-auto max-w-lg">
        <h1 className="mb-2 text-[22px] font-semibold tracking-[-0.03em]">Link inválido</h1>
        <p className="text-[14px] leading-relaxed text-neutral-500">
          Esse link expirou, já foi usado ou não é mais válido. Se precisar, responda o email de aprovação ou fale com a OITONOVE.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-lg">
      <h1 className="mb-2 text-[22px] font-semibold tracking-[-0.03em]">Completar cadastro</h1>
      <p className="mb-8 text-[14px] leading-relaxed text-neutral-500">
        Seu cadastro foi aprovado. Precisamos dos dados abaixo para organizar envio de produto e liberar seu acesso ao portal.
      </p>
      <OnboardingForm token={token} initial={creator} />
    </main>
  );
}

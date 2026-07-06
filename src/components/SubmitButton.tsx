"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({
  children,
  pendingLabel,
}: {
  children: React.ReactNode;
  pendingLabel: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-neutral-900 px-4 py-3 text-[14px] font-medium text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
      )}
      {pending ? pendingLabel : children}
    </button>
  );
}

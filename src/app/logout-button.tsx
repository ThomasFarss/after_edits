"use client";

import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await signOut({ redirect: false });
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="rounded-lg border border-red-800 bg-red-950/40 px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-900/50"
    >
      Sair
    </button>
  );
}

import { categories } from "./data/links";
import LogoutButton from "./logout-button";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#201c1e] text-zinc-50">
      <header className="relative border-b border-[#ca2027]/30 px-6 py-10 text-center sm:px-10">
        <div className="absolute right-6 top-6">
          <LogoutButton />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-[#ca2027] sm:text-4xl">
          Painel de Edição — After Effects
        </h1>
        <p className="mt-3 text-zinc-400">
          Links, sites e recursos úteis organizados por categoria
        </p>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10 sm:px-10">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
          {categories.map((category) => (
            <section
              key={category.name}
              className="rounded-xl border border-[#3a3335] bg-[#2a2426] p-5 transition-colors hover:border-[#ca2027]/60"
            >
              <h2 className="mb-4 text-lg font-semibold text-[#ca2027]">
                {category.name}
              </h2>
              <ul className="flex flex-col gap-3">
                {category.links.map((link) => (
                  <li key={link.url}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block rounded-lg border border-[#3a3335] bg-[#201c1e] p-3 transition-colors hover:border-[#ca2027] hover:bg-[#2a2426]"
                    >
                      <span className="font-medium text-zinc-50">
                        {link.title}
                      </span>
                      <p className="mt-1 text-sm text-zinc-400">
                        {link.description}
                      </p>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </main>

      <footer className="border-t border-[#3a3335] px-6 py-6 text-center text-sm text-zinc-500">
        Painel criado para auxiliar edições no Adobe After Effects
      </footer>
    </div>
  );
}

import NavBar from "@/app/ui/navbar";

export const experimental_ppr = true;

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-1 w-full max-w-5xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}

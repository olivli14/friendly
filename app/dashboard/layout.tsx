import NavBar from '@/app/ui/navbar';
 
export const experimental_ppr = true;
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen">
      <div className="w-full flex-none">
        <NavBar />
      </div>
      <div className="flex-grow p-6 overflow-y-auto">{children}</div>
    </div>
  );
}
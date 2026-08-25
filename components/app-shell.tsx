import { SidebarNav } from "@/components/sidebar-nav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <SidebarNav />
      <main className="flex min-w-0 flex-1 flex-col">{children}</main>
    </div>
  );
}

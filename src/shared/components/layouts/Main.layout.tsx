import { Outlet } from "react-router";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "../ui/sidebar";
import MainSidebar from "../sidebars/Main.sidebar";

export default function MainLayout() {
  return (
    <SidebarProvider>
      <MainSidebar />
      <SidebarInset>
        <header className="flex items-center gap-2 border-b px-3 py-2">
          <SidebarTrigger />
          <div>
            <p className="text-xs text-muted-foreground">Git Command Learning</p>
            <h1 className="text-sm font-semibold">Introduction and Core Workflow</h1>
          </div>
        </header>
        <section className="flex-1 p-4 md:p-6">
          <Outlet />
        </section>
      </SidebarInset>
    </SidebarProvider>
  );
}

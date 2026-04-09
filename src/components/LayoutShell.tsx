import { Outlet } from "react-router-dom";
import TopNav from "./TopNav";

export default function LayoutShell() {
  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <main className="flex-1 min-w-0">
        <div className="mx-auto max-w-[1280px] p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

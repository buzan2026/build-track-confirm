import { Outlet } from "react-router-dom";
import BottomNav from "./BottomNav";

export default function AppShell() {
  return (
    <div className="mx-auto min-h-screen max-w-lg bg-background pb-20">
      <Outlet />
      <BottomNav />
    </div>
  );
}

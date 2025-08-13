// MainLayout/index.js
import clsx from "clsx";
import { Outlet } from "react-router";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { getNavigationByRole } from "app/navigation";
import { useAuthContext } from "app/contexts/auth/context";

export default function MainLayout() {
  const { user } = useAuthContext(); 
  const userRole = user?.role; 
  const nav = getNavigationByRole(userRole).filter(item => item.Icon); 

  return (
    <>
      <Header />
      <main className={clsx("main-content transition-content grid grid-cols-1")}>
        <Outlet />
      </main>
      <Sidebar nav={nav} />
    </>
  );
}
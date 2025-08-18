import clsx from "clsx";

// Local Imports
import { SidebarToggleBtn } from "components/shared/SidebarToggleBtn";
import { useThemeContext } from "app/contexts/theme/context";
import { ArrowLeftStartOnRectangleIcon } from "@heroicons/react/24/outline";
import { Button } from "components/ui";
import { useAuthContext } from "app/contexts/auth/context";

export function Header() {
  const { cardSkin } = useThemeContext();
  const { logout } = useAuthContext();

  return (
    <header
      className={clsx(
        "app-header transition-content sticky top-0 z-20 flex h-[65px] shrink-0 items-center justify-between border-b border-gray-200 bg-white/80 px-(--margin-x) backdrop-blur-sm backdrop-saturate-150 dark:border-dark-600",
        cardSkin === "shadow-sm" ? "dark:bg-dark-750/80" : "dark:bg-dark-900/80"
      )}
    >
      <SidebarToggleBtn />
      <Button
        className="w-auto px-4 py-2 text-sm flex items-center gap-2 ml-auto"
        onClick={() => {
          logout();
          close(); // Verify if close() is defined; remove if unnecessary
        }}
      >
        <ArrowLeftStartOnRectangleIcon className="size-4" />
        <span>Se déconnecter</span>
      </Button>
    </header>
  );
}
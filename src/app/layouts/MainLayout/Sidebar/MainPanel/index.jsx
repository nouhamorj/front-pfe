// MainLayout/mainPanel/index.js
import PropTypes from "prop-types";
import { Link } from "react-router";
import clsx from "clsx";
import Logo from "assets/sidebarLogo.svg?react";
import { Menu } from "./Menu";

import { useThemeContext } from "app/contexts/theme/context";


export function MainPanel({ nav, setActiveSegment, activeSegment }) {
  const { cardSkin } = useThemeContext();
  return (
    <div className="main-panel">
      <div className={clsx(
        "flex h-full w-full flex-col items-center border-gray-150 bg-white dark:border-dark-600/80 ltr:border-r rtl:border-l",
        cardSkin === "shadow-sm" ? "dark:bg-dark-750" : "dark:bg-dark-900",
      )}>
        <div className="flex pt-3.5">
          <Link to="/">
            <Logo className="size-10 text-primary-600 dark:text-primary-400" />
          </Link>
        </div>

        <Menu
          nav={nav}
          activeSegment={activeSegment}
          setActiveSegment={setActiveSegment}
        />

        <div className="flex flex-col items-center space-y-3 py-2.5">
         
        </div>
      </div>
    </div>
  );
}

MainPanel.propTypes = {
  nav: PropTypes.array.isRequired,
  setActiveSegment: PropTypes.func,
  activeSegment: PropTypes.string,
};
// Sidebar/index.js
import { useMemo, useState, useEffect } from "react";
import { useLocation } from "react-router";

import { useBreakpointsContext } from "app/contexts/breakpoint/context";
import { useSidebarContext } from "app/contexts/sidebar/context";
import { getNavigationByRole } from "app/navigation";
import { useDidUpdate } from "hooks";
import { isRouteActive } from "utils/isRouteActive";
import { MainPanel } from "./MainPanel";
import { PrimePanel } from "./PrimePanel";

export function Sidebar() {
  const { pathname } = useLocation();
  const { name, lgAndDown } = useBreakpointsContext();
  const { isExpanded, close } = useSidebarContext();

  // 🔐 Récupérer le rôle
  const storedUser = JSON.parse(localStorage.getItem('authUser') || '{}');
  const userRole = storedUser.role || 'guest';

  // 🧩 Navigation filtrée
  const navigation = useMemo(() => getNavigationByRole(userRole), [userRole]);

  // 🔍 Étape 1 : Trouver l'item racine actif (avec path)
  const initialSegment = useMemo(() => {
    return navigation.find(item => item.path && isRouteActive(item.path, pathname)) || null;
  }, [navigation, pathname]);

  const [activeSegmentPath, setActiveSegmentPath] = useState(initialSegment?.path || null);

  // 🔍 Étape 2 : Déclencher mise à jour si l'URL correspond à un enfant
  useDidUpdate(() => {
    const matchedItem = navigation.find(item => item.path && isRouteActive(item.path, pathname));
    if (matchedItem && matchedItem.path !== activeSegmentPath) {
      setActiveSegmentPath(matchedItem.path);
    }
  }, [pathname, navigation]);

  // 🔎 currentSegment : doit être le parent dont un enfant est actif
  const currentSegment = useMemo(() => {
    // 1. Si l'item actif est un parent avec childs
    const directMatch = navigation.find(item => item.path === activeSegmentPath);
    if (directMatch && directMatch.childs?.length > 0) {
      return directMatch;
    }

    // 2. Chercher un parent dont un enfant a le path actuel
    const parentWithActiveChild = navigation.find(item =>
      item.childs?.some(child => child.path === activeSegmentPath)
    );
    if (parentWithActiveChild) {
      return parentWithActiveChild;
    }

    return null;
  }, [activeSegmentPath, navigation]);

  // 🚀 Effet immédiat : si activeSegmentPath est null mais pathname correspond à un child, forcer le bon parent
  useEffect(() => {
    if (!activeSegmentPath && pathname) {
      const parentWithMatchingChild = navigation.find(item =>
        item.childs?.some(child => child.path === pathname)
      );
      if (parentWithMatchingChild) {
        // On ne change pas activeSegmentPath, mais on veut que PrimePanel s'affiche
        // Donc on ne fait rien ici → car currentSegment dépend de activeSegmentPath
        // On force plutôt activeSegmentPath
        setActiveSegmentPath(pathname);
      }
    }
  }, [activeSegmentPath, pathname, navigation]);

  // 📱 Fermer la sidebar sur mobile
  useDidUpdate(() => {
    if (lgAndDown && isExpanded) close();
  }, [name, isExpanded, lgAndDown]);

  return (
    <>
      <MainPanel
        nav={navigation.filter(item => item.Icon)}
        activeSegment={activeSegmentPath}
        setActiveSegment={setActiveSegmentPath}
      />

      {currentSegment && (
        <PrimePanel
          close={close}
          currentSegment={currentSegment}
          pathname={pathname}
        />
      )}
    </>
  );
}
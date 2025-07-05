import GhostGuard from "middleware/GhostGuard";

const ghostRoutes = {
  id: "ghost",
  Component: GhostGuard,
  children: [
    {
      path: "se-connecter",
      lazy: async () => ({
        Component: (await import("app/pages/Auth")).default,
      }),
    },
    {
      path : "mot-de-passe-oublie",
      lazy : async () => ({
          Component: (await import("app/pages/Auth/forget_password")).default,
      }),
    },
    {
      path : "nouveau-mot-de-passe/:token",
      lazy : async () => ({
          Component: (await import("app/pages/Auth/reset_password")).default,
      }),
    },
  ],
};

export { ghostRoutes };

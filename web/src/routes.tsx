import { Link, createRootRoute, createRoute, createRouter, Outlet } from "@tanstack/react-router";
import ItemsPage from "@/screens/ItemsPage";
import CategoriesPage from "@/screens/CategoriesPage";
import React from "react";
import "./index.css";

// Layout raiz com menu
function RootLayout() {
  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <header className="mb-4 flex gap-4">
      <Link to="/" className="[&.active]:font-semibold">Itens</Link>
      <Link to="/categorias" className="[&.active]:font-semibold">Categorias</Link>
      </header>
      <Outlet />
    </div>
  );
}

// ...
const rootRoute = createRootRoute({ component: RootLayout })

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: ItemsPage,
})

const categoriesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/categorias",           // <— aqui em PT-BR
  component: CategoriesPage,
})

export const router = createRouter({
  routeTree: rootRoute.addChildren([indexRoute, categoriesRoute]),
})

// Tipagem do TanStack Router
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

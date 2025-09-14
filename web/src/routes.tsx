import { createRootRoute, createRouter, createRoute } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "sonner";
import ItemsPage from "./screens/ItemsPage";

const queryClient = new QueryClient();

const Root = () => (
  <QueryClientProvider client={queryClient}>
    <div className="min-h-screen max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Lista de Compras</h1>
      <ItemsOutlet />
    </div>
    <Toaster richColors />
    <ReactQueryDevtools initialIsOpen={false} />
  </QueryClientProvider>
);

// Outlet simples para manter a estrutura
const ItemsOutlet = () => <ItemsPage />;

const rootRoute = createRootRoute({ component: Root });

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: ItemsPage,
});

const routeTree = rootRoute.addChildren([indexRoute]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

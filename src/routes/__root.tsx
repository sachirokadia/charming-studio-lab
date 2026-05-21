import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { Toaster } from "sonner";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="glass-card max-w-md p-10 text-center">
        <h1 className="text-7xl font-bold text-primary">404</h1>
        <h2 className="mt-3 text-xl font-bold">Quest not found</h2>
        <p className="mt-2 text-sm text-on-surface-variant">
          This dungeon doesn't exist. Head back to the hub.
        </p>
        <Link to="/" className="btn-grad mt-6 inline-flex rounded-full px-6 py-3 text-sm">
          Return to Hub
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="glass-card max-w-md p-10 text-center">
        <h1 className="text-xl font-bold">Something glitched</h1>
        <p className="mt-2 text-sm text-on-surface-variant">{error.message}</p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="btn-grad rounded-full px-5 py-2 text-sm"
          >Try again</button>
          <a href="/" className="rounded-full border border-outline-variant px-5 py-2 text-sm">Home</a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "FinGame — Level Up Your Money" },
      { name: "description", content: "Turn saving money into an RPG quest. Gamified expense tracker with quests, badges, XP & streaks." },
      { property: "og:title", content: "FinGame — Level Up Your Money" },
      { property: "og:description", content: "Gamified expense tracker. Quests, badges, XP and streaks." },
      { property: "og:type", content: "website" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/icon?family=Material+Symbols+Outlined" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <Toaster theme="dark" position="top-center" toastOptions={{ style: { background: '#171f33', color: '#dae2fd', border: '1px solid rgba(255,255,255,0.08)' } }} />
    </QueryClientProvider>
  );
}

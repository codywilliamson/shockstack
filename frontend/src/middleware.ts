import { defineMiddleware } from "astro:middleware";

const protectedRoutes = ["/dashboard"];

// static/prerendered routes that should skip auth
const staticRoutes = ["/blog", "/docs", "/changelog", "/rss.xml"];

export const onRequest = defineMiddleware(async (context, next) => {
  const pathname = context.url.pathname;

  // skip auth for static content and api routes
  const isStatic =
    pathname === "/" ||
    staticRoutes.some((r) => pathname.startsWith(r)) ||
    pathname.startsWith("/api/");

  if (isStatic) {
    context.locals.user = null;
    context.locals.session = null;
    return next();
  }

  // lazy import to avoid loading auth on static routes
  const { auth } = await import("./lib/auth");

  const session = await auth.api.getSession({
    headers: context.request.headers,
  });

  context.locals.user = session?.user ?? null;
  context.locals.session = session?.session ?? null;

  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );

  if (isProtected && !session) {
    return context.redirect("/login");
  }

  return next();
});

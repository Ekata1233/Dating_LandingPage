"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/app/components/Navbar/Navbar";
import { APP_ROOT } from "@/app/app/config/sections";

export default function ConditionalNavbar() {
  const pathname = usePathname();

  const hideNavbarRoutes = ["/onBoarding"];

  /* Every section under /app is an app route, not a marketing page, so the
     whole subtree has to match — not just /app itself. */
  const shouldHideNavbar =
    pathname === APP_ROOT ||
    pathname.startsWith(`${APP_ROOT}/`) ||
    hideNavbarRoutes.includes(pathname);

  if (shouldHideNavbar) {
    return null;
  }

  return <Navbar logoSrc="/public/logo.png" />;
}

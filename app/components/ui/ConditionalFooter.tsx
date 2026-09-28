"use client";

import { usePathname } from "next/navigation";
import Footer from "@/app/components/Footer/Footer";
import { APP_ROOT } from "@/app/app/config/sections";

export default function ConditionalFooter() {
  const pathname = usePathname();

  const hideFooterRoutes = ["/onBoarding"];

  /* Every section under /app is an app route, not a marketing page, so the
     whole subtree has to match — not just /app itself. */
  const shouldHideFooter =
    pathname === APP_ROOT ||
    pathname.startsWith(`${APP_ROOT}/`) ||
    hideFooterRoutes.includes(pathname);

  if (shouldHideFooter) {
    return null;
  }

  return <Footer />;
}

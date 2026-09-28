"use client";

import { usePathname } from "next/navigation";
import Footer from "@/app/components/Footer/Footer";

export default function ConditionalFooter() {
  const pathname = usePathname();

  const hideFooterRoutes = ["/app","/onBoarding"];

  const shouldHideFooter = hideFooterRoutes.includes(pathname);

  if (shouldHideFooter) {
    return null;
  }

  return <Footer />;
}
"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/app/components/Navbar/Navbar";

export default function ConditionalNavbar() {
  const pathname = usePathname();

  const hideNavbarRoutes = ["/app","/onBoarding"];

  const shouldHideNavbar = hideNavbarRoutes.includes(pathname);

  if (shouldHideNavbar) {
    return null;
  }

  return <Navbar />;
}
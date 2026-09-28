"use client";

import React from "react";

import AdmiererSidebar from "../panels/AdmirersSidebar";
import type { AdmiererSidebarProps, AdmirersTab } from "../panels/AdmirersSidebar";

/* -------------------------------------------------------------------------- */
/*  Admirers – the Received / Sent grid the desktop sidebar used to own.        */
/* -------------------------------------------------------------------------- */

const MobileAdmirerSection: React.FC<
  Omit<AdmiererSidebarProps, "showHeader">
> = ({ className = "", ...rest }) => (
  <AdmiererSidebar showHeader={true} className={className} {...rest} />
);

export type { AdmirersTab };
export default MobileAdmirerSection;

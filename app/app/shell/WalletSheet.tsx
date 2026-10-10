"use client";

import React from "react";

import HomeSidebar from "../panels/HomeSidebar";
import MobileSheet from "./MobileSheet";

/* -------------------------------------------------------------------------- */
/*  Wallet & Plans as a mobile bottom sheet.                                   */
/*                                                                            */
/*  Wallet content that has no place in a mobile tab, lifted out of the desktop */
/*  rail's Home panel. The rail itself is unmounted below md, so this is the    */
/*  only way to reach it on a phone.                                          */
/* -------------------------------------------------------------------------- */

export interface WalletSheetProps {
  open: boolean;
  onClose: () => void;
  className?: string;
}

const WalletSheet: React.FC<WalletSheetProps> = ({
  open,
  onClose,
  className,
}) => {
  return (
    <MobileSheet
      open={open}
      onClose={onClose}
      title="Wallet & Plans"
      className={className}
    >
      <HomeSidebar  />
    </MobileSheet>
  );
};

export default WalletSheet;

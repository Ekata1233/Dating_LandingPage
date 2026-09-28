import type { ReactNode } from "react";

/* -------------------------------------------------------------------------- */
/*  Onboarding layout.                                                          */
/*                                                                            */
/*  This used to return a bare <div> and ignore `children`, which meant the     */
/*  page below it never mounted. Passing children through is all this needs    */
/*  until the flow grows its own chrome (progress bar, skip link).             */
/* -------------------------------------------------------------------------- */

export default function OnBoardingLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

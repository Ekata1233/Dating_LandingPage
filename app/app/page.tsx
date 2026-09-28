import { redirect } from "next/navigation";

import { DEFAULT_SECTION, pathForSection } from "./config/sections";

/** The app has no index view of its own — it opens on Home. */
export default function Page() {
  redirect(pathForSection(DEFAULT_SECTION));
}

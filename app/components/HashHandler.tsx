"use client";

import { useEffect } from "react";

export default function HashHandler() {
  useEffect(() => {
    // On page load/reload, remove the hash from URL
    if (window.location.hash) {
      history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  return null;
}

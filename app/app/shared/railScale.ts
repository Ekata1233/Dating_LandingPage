/* -------------------------------------------------------------------------- */
/*  Rail-anchored proportional units.                                          */
/*                                                                            */
/*  The desktop rail is 20.6% of a 1440px frame (296px) and its height tracks  */
/*  the viewport (900px reference). `rw(px)` renders that many px on a 1440    */
/*  screen and scales with the rail's width; `rh(px)` does the same at 900px   */
/*  tall, scaling with the screen height. Both resolve against the rail, which */
/*  layout.tsx makes a `container-type: size`.                                 */
/*                                                                            */
/*  On phones the rail is replaced by a full-width stack, so the same `cqw`    */
/*  would resolve against the viewport and inflate. `--mobile-cap` (set to 1   */
/*  under 768px in globals.css) caps each value at its 296px-rail size; with   */
/*  the variable unset the `min()` falls back to the raw `cqw`/`cqh`.          */
/* -------------------------------------------------------------------------- */

export const rw = (px: number): string =>
  `min(${+((px * 100) / 296).toFixed(3)}cqw, calc(${px}px * var(--mobile-cap, 9999)))`;
export const rh = (px: number): string =>
  `min(${+((px * 100) / 900).toFixed(3)}cqh, calc(${px}px * var(--mobile-cap, 9999)))`;

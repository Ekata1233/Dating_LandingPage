/* -------------------------------------------------------------------------- */
/*  Rail-anchored proportional units.                                          */
/*                                                                            */
/*  The desktop rail is 20.6% of a 1440px frame (296px) and its height tracks  */
/*  the viewport (900px reference). `rw(px)` renders that many px on a 1440    */
/*  screen and scales with the rail's width; `rh(px)` does the same at 900px   */
/*  tall, scaling with the screen height. Both resolve against the rail, which */
/*  layout.tsx makes a `container-type: size`.                                 */
/* -------------------------------------------------------------------------- */

export const rw = (px: number): string => `${+((px * 100) / 296).toFixed(3)}cqw`;
export const rh = (px: number): string => `${+((px * 100) / 900).toFixed(3)}cqh`;

/**
 * The Arijentek mark, as data.
 *
 * Taken from the supplied logo files (logo/1.svg, SVG/Artboard 8.svg). The
 * brand sheet draws the mark as two separate shapes, and so does everything
 * built from it here: the long 45° bar, and the stepped block (stem plus
 * crossbar). Their facing edges sit on parallel 45° lines a quarter of the
 * stroke apart — the seam.
 *
 * Measured in logo units (the viewBox of logo/1.svg):
 *   stroke (bar thickness = stem width = crossbar height)  ≈ 109.9
 *   seam gap                                               ≈ 27.2  (≈ S/4)
 *   bar's inner edge:   x + y = 1171.8
 *   block's outer cut:  x + y = 1210.2
 *   bounds: x 277 → 838.2, y 340 → 739.4  (≈ 1.41 : 1)
 */

export const MARK_D =
  "M738.503 433.308C738.169 433.642 737.852 433.976 737.5 434.311L448.495 723.315C438.55 733.26 424.82 739.422 409.647 739.422H277L566.516 449.906L659.383 357.038C659.471 356.933 659.576 356.827 659.682 356.722L660.932 355.472C661.037 355.366 661.143 355.261 661.248 355.173C671.105 345.773 684.466 340 699.163 340H831.793L738.503 433.308ZM838.18 372.054V739.404H728.274V669.384C727.394 669.384 726.531 669.42 725.669 669.473H540.744L580.718 629.498L634.544 575.672C644.489 565.727 658.219 559.584 673.392 559.584H728.274V504.631C728.274 490.145 733.871 476.96 743.042 467.156L745.665 464.534L838.162 372.036L838.18 372.054Z";

export const BAR_D = MARK_D.slice(0, MARK_D.indexOf("ZM") + 1);
export const BLOCK_D = MARK_D.slice(MARK_D.indexOf("ZM") + 1);

export const MARK = {
  stroke: 109.9,
  minX: 277,
  maxX: 838.2,
  minY: 340,
  maxY: 739.4,
  /** x + y at the middle of the seam. */
  seam: (1171.8 + 1210.2) / 2,
  /** Half the gap, measured at right angles to the seam. */
  halfGap: (1210.2 - 1171.8) / 2 / Math.SQRT2,
};

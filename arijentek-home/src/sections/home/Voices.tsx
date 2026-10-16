import { useMediaQuery, useReducedMotion } from "../../lib/motion";
import { useVariant } from "../../lib/variants";
import { VoicesTheatre } from "./voices/VoicesTheatre";
import { VoicesRail } from "./voices/VoicesRail";
import { VoicesStack } from "./voices/VoicesStack";
import { VoicesList } from "./voices/shared";

/**
 * Voices. Three layouts, chosen from the Design menu (lib/variants):
 *   A  quote theatre   — one quote at a time, at display size
 *   B  horizontal rail — the cards travel sideways
 *   C  card stack      — cards lift off a pile along the 45° line
 * Phones and reduced motion get the quotes as a list, whichever layout is
 * chosen. PLACEHOLDER — the quotes are invented.
 */
export function Voices() {
  const variant = useVariant("voices");
  const wide = useMediaQuery("(min-width: 900px)");
  const reduced = useReducedMotion();

  if (reduced || !wide) return <VoicesList />;
  if (variant === "c") return <VoicesStack />;
  return variant === "b" ? <VoicesRail /> : <VoicesTheatre />;
}

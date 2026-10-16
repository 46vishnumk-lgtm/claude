import { useVariant } from "../../lib/variants";
import { CloseFinale } from "./close/CloseFinale";
import { CloseGiant } from "./close/CloseGiant";
import { CloseForm } from "./close/CloseForm";

/**
 * Close. Three layouts, chosen from the Design menu (lib/variants):
 *   A  mark finale    — the finished A mark returns and closes the story
 *   B  giant type     — the question grows to fill the screen
 *   C  blueprint form — a three-field enquiry drafted onto a grid
 * Each handles phones and reduced motion itself.
 */
export function Close() {
  const variant = useVariant("close");
  if (variant === "b") return <CloseGiant />;
  if (variant === "c") return <CloseForm />;
  return <CloseFinale />;
}

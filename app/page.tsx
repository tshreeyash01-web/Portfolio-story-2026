/**
 * Beats 1–5 are built from Figma (nodes 53:422, 53:470, 53:490, 53:584 and
 * 53:590). Beats 6–8 are still the static skeleton — each gets built in turn.
 * Source of truth: docs/02-beats.md + docs/04-design-language.md
 *
 * Beats 4 and 5 share ONE pinned section (Beat5Proof): the "Adaptability"
 * statement has to travel from Beat 4's centre to Beat 5's right-hand slot, and
 * two separate pins can't hand an element over. See docs/05-build-plan.md.
 *
 * The nav lives inside Beat1Hero because the Figma frame owns it. A
 * persistent nav across the later beats is still an open decision.
 */

import Beat1Hero from "./components/beats/Beat1Hero";
import Beat2TwoThings from "./components/beats/Beat2TwoThings";
import Beat3Archive from "./components/beats/Beat3Archive";
import Beat5Proof from "./components/beats/Beat5Proof";
import Beat67PeoplePresent from "./components/beats/Beat67PeoplePresent";
import Beat8Now from "./components/beats/Beat8Now";

export default function Home() {
  return (
    <main className="relative">
      <Beat1Hero />
      <Beat2TwoThings />
      <Beat3Archive />
      <Beat5Proof />
      <Beat67PeoplePresent />
      <Beat8Now />
    </main>
  );
}

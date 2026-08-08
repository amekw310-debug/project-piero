// 目閉じPIEROを使った一度きりの瞬き（再利用可能）。
// OPENING の瞬きと同じ構造・同じ短さで、Part 2 の周期的な瞬きにも使う。

import gsap from "gsap";
import type { StageRefs } from "./stage";
import { T } from "./config";

export function playBlink(refs: StageRefs): gsap.core.Timeline {
  const tl = gsap.timeline();
  tl.to(refs.pieroBlink, { opacity: 1, duration: T.blinkIn, ease: "power2.inOut" }).to(
    refs.pieroBlink,
    { opacity: 0, duration: T.blinkOut, ease: "power2.inOut" }
  );
  return tl;
}

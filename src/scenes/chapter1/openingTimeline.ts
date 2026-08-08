// OPENING（0:00〜0:14）の GSAP タイムライン。
// すべての演出は GSAP に集約し、将来のパーツ差し替え時も timeline 側の構造を保てるようにする。

import gsap from "gsap";
import type { StageRefs } from "./stage";
import { NEON_SPOTS, T } from "./config";

/** タイムライン開始前の初期状態（＝0:00 の完全な黒） */
function setInitial(refs: StageRefs): void {
  gsap.set(refs.blackout, { opacity: 1 });
  gsap.set(refs.parkImg, {
    filter: "brightness(0.30) saturate(0.9)",
    scale: 1.06,
    transformOrigin: "50% 50%",
  });
  gsap.set(refs.parkDark, { opacity: 0 });
  Object.values(refs.neon).forEach((n) => gsap.set(n, { opacity: 0 }));
  gsap.set(refs.reflection, { opacity: 0 });
  gsap.set(refs.spotlight, { opacity: 0, scale: 0.6, transformOrigin: "50% 50%" });
  gsap.set(refs.vignette, { opacity: 0 });
  gsap.set(refs.titleScrim, { opacity: 0 });
  gsap.set(refs.piero, {
    opacity: 0,
    yPercent: 6,
    scale: 1.06,
    filter: "brightness(0.12)",
    transformOrigin: "50% 50%",
  });
  gsap.set([refs.eyes.left, refs.eyes.right], { opacity: 0, xPercent: -35 });
  refs.titleLines.forEach((line) =>
    gsap.set(line.querySelectorAll(".seg"), { opacity: 0 })
  );
  gsap.set(refs.choose, { opacity: 0, y: 12 });
}

/** ネオンを「チカチカッ」と点灯させる（電気が入る演出） */
function igniteFlicker(tl: gsap.core.Timeline, el: HTMLElement, at: number): void {
  tl.to(
    el,
    { keyframes: { opacity: [0, 0.6, 0.2, 1, 0.75, 1] }, duration: 0.7, ease: "none" },
    at
  );
}

/** 演出をスキップ / reduced-motion 用に、点灯後の最終状態を即時適用する */
export function applyFinalState(refs: StageRefs): void {
  gsap.set(refs.blackout, { opacity: 0 });
  gsap.set(refs.parkImg, { filter: "brightness(0.82) saturate(1.05)", scale: 1.06 });
  gsap.set(refs.parkDark, { opacity: 0.4 });
  Object.values(refs.neon).forEach((n) => gsap.set(n, { opacity: 1 }));
  gsap.set(refs.reflection, { opacity: 0.75 });
  gsap.set(refs.spotlight, { opacity: 1, scale: 1 });
  gsap.set(refs.vignette, { opacity: 0.92 });
  gsap.set(refs.titleScrim, { opacity: 1 });
  gsap.set(refs.piero, { opacity: 1, yPercent: 0, scale: 1, filter: "brightness(1)" });
  gsap.set([refs.eyes.left, refs.eyes.right], { opacity: 0 });
  refs.titleLines.forEach((line) =>
    gsap.set(line.querySelectorAll(".seg"), { opacity: 1 })
  );
  gsap.set(refs.choose, { opacity: 1, y: 0 });
}

export function createOpeningTimeline(
  refs: StageRefs,
  onComplete: () => void
): gsap.core.Timeline {
  setInitial(refs);
  const eyes = [refs.eyes.left, refs.eyes.right];
  const tl = gsap.timeline({ onComplete });

  // 0:02–0:04 遊園地が暗闇から目覚める
  tl.to(refs.blackout, { opacity: 0, duration: 1.3, ease: "power1.inOut" }, T.parkAt);
  tl.to(
    refs.parkImg,
    { filter: "brightness(0.82) saturate(1.05)", duration: T.parkDur, ease: "power2.out" },
    T.parkAt
  );
  // ネオンが順番に点灯
  NEON_SPOTS.forEach((s, i) => igniteFlicker(tl, refs.neon[s.id], T.neonAt[i]));
  // 濡れた地面のネオン反射が徐々に見えてくる
  tl.to(refs.reflection, { opacity: 0.75, duration: T.reflDur, ease: "power2.out" }, T.reflAt);

  // 0:04– 背景を落として主役を際立たせる
  tl.to(refs.parkDark, { opacity: 0.4, duration: 1.6, ease: "power2.inOut" }, T.darkenAt);
  tl.to(refs.vignette, { opacity: 0.92, duration: 1.8, ease: "power2.out" }, T.darkenAt);

  // 0:04–0:07 スポットライト点灯 → PIERO が暗闇から浮かび上がる
  tl.to(refs.spotlight, { opacity: 1, scale: 1, duration: T.spotDur, ease: "power2.out" }, T.spotAt);
  tl.to(
    refs.piero,
    { opacity: 1, yPercent: 0, scale: 1, filter: "brightness(1)", duration: T.pieroDur, ease: "power2.out" },
    T.pieroAt
  );

  // 0:07–0:09 視線の代替演出:
  //   piero.png は1枚画像のため瞳自体は動かさない（不自然な変形はしない）。
  //   代わりに、瞳の位置に小さなキャッチライト（グリント）を出し、
  //   外側→中央へ移して「目が合った」印象を作り、一度だけ瞬きさせて消す。
  //   将来 piero-pupil-l/r.png を分割したら、この演出を実際の瞳移動へ置き換える。
  tl.to(eyes, { opacity: 0.85, duration: 0.6, ease: "power2.out" }, T.gazeAt);
  tl.to(eyes, { xPercent: 0, duration: 0.9, ease: "power2.inOut" }, T.gazeAt + 0.1);
  tl.to(eyes, { opacity: 0, duration: 0.11, yoyo: true, repeat: 1, ease: "power1.inOut" }, T.gazeAt + 1.15); // 瞬き
  tl.to(eyes, { opacity: 0, duration: 0.6, ease: "power1.out" }, T.gazeAt + 1.5); // 画像を汚さないよう消す
  // ごく僅かな「気づき」（顔は動かさず、全体を極小スケールで前後）
  tl.to(refs.piero, { scale: 1.012, duration: 0.5, yoyo: true, repeat: 1, ease: "sine.inOut" }, T.gazeAt + 0.25);

  // 0:09–0:12 タイトル電飾（部分点灯 → 全体点灯）
  tl.to(refs.titleScrim, { opacity: 1, duration: 0.9, ease: "power2.out" }, T.titleAt - 0.3);
  refs.titleLines.forEach((line, i) => {
    const segs = line.querySelectorAll(".seg");
    tl.to(
      segs,
      {
        keyframes: { opacity: [0, 0.55, 0.12, 1] },
        duration: 0.55,
        ease: "none",
        stagger: { each: 0.045, from: "random" },
      },
      T.titleAt + i * T.titleGap
    );
  });

  // 0:12–0:14 CHOOSE YOUR POINT OF VIEW.
  tl.to(refs.choose, { y: 0, duration: T.chooseDur, ease: "power2.out" }, T.chooseAt);
  tl.to(
    refs.choose,
    { keyframes: { opacity: [0, 0.6, 0.2, 1] }, duration: 0.75, ease: "none" },
    T.chooseAt
  );

  // 0:14 で終了（onComplete が発火するよう長さを確保）
  tl.to({}, { duration: 0.01 }, T.endAt);

  return tl;
}

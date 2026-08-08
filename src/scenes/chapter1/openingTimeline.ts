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
  gsap.set(refs.pieroBlink, { opacity: 0 });
  // 目の反射オーバーレイは無効（開眼後は通常PIERO本来の青い瞳に戻す）。
  // 要素は将来のパーツ差し替え用アンカーとして残す。
  gsap.set([refs.eyes.left, refs.eyes.right], { opacity: 0 });
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
  gsap.set(refs.pieroBlink, { opacity: 0 });
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

  // 0:07–0:09 一度だけの自然な瞬き（通常PIERO → 目閉じPIERO → 通常PIERO）。
  //   目の領域だけをマスクした「目閉じPIERO」を通常PIEROの上に重ね、
  //   その不透明度のみを短くクロスフェード（合計 ~0.4秒）。
  //   マスク外（顔・鼻・帽子・髪・襟）は常に通常PIERO = 動いて見えない。
  //   パッと切り替えず、ごく短いフェードで自然な瞬きにする。
  tl.to(refs.pieroBlink, { opacity: 1, duration: T.blinkIn, ease: "power2.inOut" }, T.blinkAt);
  tl.to(
    refs.pieroBlink,
    { opacity: 0, duration: T.blinkOut, ease: "power2.inOut" },
    T.blinkAt + T.blinkIn
  );

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

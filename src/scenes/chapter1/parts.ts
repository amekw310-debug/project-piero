// Part 2 の実パーツ制御。
// 各パーツは 1536x1024（＝base と同じキャンバス）の透過PNG。
// base の該当特徴の bbox（実測）に一致するよう、パーツ特徴中心を origin にして
// 非等倍 scale + translate で写像する（すべて .piero コンテナ基準の相対値）。
//
// 実測（piero.png 基準, %）:
//   HAT   base bbox   center(49.93,16.60) size(19.92 x 32.42)
//   HAT   part bbox   center(50.33,50.10) size(44.79 x 92.77) -> sx=.4448 sy=.3495
//   MOUTH base bbox   center(49.93,69.92) size(35.94 x 19.92)
//   MOUTH part(normal)center(51.01,67.38) size(63.09 x 49.80) -> sx=.5697 sy=.4000
//   IRIS  base L(42.51,50.63) R(57.19,50.49) 直径 ~3.0%（→overlayは3.4%で確実に覆う）

import gsap from "gsap";
import type { StageRefs } from "./stage";
import { assetUrl } from "./config";

const HAT = { ox: 50.33, oy: 50.1, sx: 0.4448, sy: 0.3495, dx: -0.4, dy: -33.5 };
const MOUTH = { ox: 51.01, oy: 67.38, sx: 0.5697, sy: 0.4, dx: -1.08, dy: 2.54 };

export interface PartsApi {
  pupilTrack(nx: number, ny: number): void;
  pupilReverseThenCorrect(side: "l" | "r", nx: number, ny: number): void;
  liftHat(px: number, dur?: number): void;
  settleHat(dur?: number): void;
  hatHint(): void;
  mouthSmile(on: boolean): void;
  destroy(): void;
}

export function setupParts(refs: StageRefs, reduced: boolean): PartsApi {
  const p = refs.parts;
  const iris = `url("${assetUrl("piero-eye-iris.png")}")`;
  p.pupilL.style.backgroundImage = iris;
  p.pupilR.style.backgroundImage = iris;

  // 配置（非等倍 scale で base の bbox に一致させる）
  gsap.set([p.mouthNormal, p.mouthSmile], {
    transformOrigin: `${MOUTH.ox}% ${MOUTH.oy}%`,
    scaleX: MOUTH.sx,
    scaleY: MOUTH.sy,
    xPercent: MOUTH.dx,
    yPercent: MOUTH.dy,
  });
  // 静止状態は base の口をそのまま見せる（＝完全一致を保証）。口パーツは非表示で待機。
  gsap.set(p.mouthNormal, { opacity: 0 });
  gsap.set(p.mouthSmile, { opacity: 0 });

  gsap.set(p.hat, {
    transformOrigin: `${HAT.ox}% ${HAT.oy}%`,
    scaleX: HAT.sx,
    scaleY: HAT.sy,
    xPercent: HAT.dx,
    yPercent: HAT.dy,
  });
  gsap.set([p.pupilL, p.pupilR], { xPercent: -50, yPercent: -50, x: 0, y: 0 });

  // 瞳の最大移動は px 固定ではなくコンテナ幅基準（スマホでも同比率）
  const cw = refs.piero.getBoundingClientRect().width || 1350;
  const MAXX = cw * 0.0026; // ≈ 3.5px @1350
  const MAXY = cw * 0.0018;

  const d = 0.55;
  const lx = gsap.quickTo(p.pupilL, "x", { duration: d, ease: "power2" });
  const ly = gsap.quickTo(p.pupilL, "y", { duration: d, ease: "power2" });
  const rx = gsap.quickTo(p.pupilR, "x", { duration: d, ease: "power2" });
  const ry = gsap.quickTo(p.pupilR, "y", { duration: d, ease: "power2" });

  return {
    pupilTrack(nx, ny) {
      if (reduced) return;
      lx(nx * MAXX);
      ly(ny * MAXY);
      rx(nx * MAXX);
      ry(ny * MAXY);
    },
    pupilReverseThenCorrect(side, nx, ny) {
      if (reduced) return;
      const el = side === "l" ? p.pupilL : p.pupilR;
      gsap
        .timeline()
        .to(el, { x: -nx * MAXX - MAXX * 0.8, y: -ny * MAXY, duration: 0.14, ease: "power2.out" })
        .to(el, { x: nx * MAXX, y: ny * MAXY, duration: 0.5, ease: "power2.inOut" }, "+=0.12");
    },
    liftHat(px, dur = 0.5) {
      gsap.to(p.hat, { y: -Math.abs(px), duration: dur, ease: "power2.out" });
    },
    settleHat(dur = 0.7) {
      gsap.to(p.hat, { y: 0, duration: dur, ease: "power2.inOut" });
    },
    hatHint() {
      if (reduced) return;
      gsap
        .timeline()
        .to(p.hat, { y: -5, duration: 0.45, ease: "power2.out" })
        .to(p.hat, { y: 0, duration: 0.85, ease: "power2.inOut" }, "+=0.12");
    },
    // MYSTERY: base の口の上に smile を重ねてクロスフェード（顔全体は差し替えない）
    mouthSmile(on) {
      gsap.to(p.mouthSmile, { opacity: on ? 1 : 0, duration: 0.28, ease: "power1.inOut" });
    },
    destroy() {
      gsap.killTweensOf([p.pupilL, p.pupilR, p.hat, p.mouthSmile, p.mouthNormal]);
    },
  };
}

// Part 2 の実パーツ制御。
// 各パーツは 1536x1024（＝base と同じキャンバス）の透過PNG。
// .piero ボックス基準の transform で「その特徴点を base の同じ位置へ」写像して重ねる。
// 数値は実測からの初期値（微調整可）。

import gsap from "gsap";
import type { StageRefs } from "./stage";
import { assetUrl } from "./config";

// 帽子: パーツ内の帽子中心(ox,oy) を scale して base帽子中心(=ox+dx, oy+dy) へ
const HAT = { ox: 50.4, oy: 51.6, s: 0.28, dx: 0.1, dy: -35.8 };
// 口: パーツ内の口中心 を base口中心へ
const MOUTH = { ox: 50, oy: 61, s: 0.35, dx: 0.3, dy: 8.5 };
// 瞳の最大移動（px相当。ごく僅か）
const MAXX = 3.2;
const MAXY = 2.2;

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

  // 配置（transform）
  gsap.set([p.mouthNormal, p.mouthSmile], {
    transformOrigin: `${MOUTH.ox}% ${MOUTH.oy}%`,
    scale: MOUTH.s,
    xPercent: MOUTH.dx,
    yPercent: MOUTH.dy,
  });
  gsap.set(p.hat, {
    transformOrigin: `${HAT.ox}% ${HAT.oy}%`,
    scale: HAT.s,
    xPercent: HAT.dx,
    yPercent: HAT.dy,
  });
  gsap.set([p.pupilL, p.pupilR], { xPercent: -50, yPercent: -50, x: 0, y: 0 });

  const dur = 0.55;
  const lx = gsap.quickTo(p.pupilL, "x", { duration: dur, ease: "power2" });
  const ly = gsap.quickTo(p.pupilL, "y", { duration: dur, ease: "power2" });
  const rx = gsap.quickTo(p.pupilR, "x", { duration: dur, ease: "power2" });
  const ry = gsap.quickTo(p.pupilR, "y", { duration: dur, ease: "power2" });

  return {
    pupilTrack(nx, ny) {
      if (reduced) return;
      const x = nx * MAXX;
      const y = ny * MAXY;
      lx(x);
      ly(y);
      rx(x);
      ry(y);
    },
    // 右目ODD用: 一瞬だけ逆方向 → 本来の方向へ戻す
    pupilReverseThenCorrect(side, nx, ny) {
      const el = side === "l" ? p.pupilL : p.pupilR;
      if (reduced) return;
      gsap
        .timeline()
        .to(el, { x: -nx * MAXX - 2.4, y: -ny * MAXY, duration: 0.14, ease: "power2.out" })
        .to(el, { x: nx * MAXX, y: ny * MAXY, duration: 0.5, ease: "power2.inOut" }, "+=0.12");
    },
    liftHat(px, d = 0.5) {
      gsap.to(p.hat, { y: -Math.abs(px), duration: d, ease: "power2.out" });
    },
    settleHat(d = 0.7) {
      gsap.to(p.hat, { y: 0, duration: d, ease: "power2.inOut" });
    },
    // ヒント用「フワッ」（一度だけ数px浮いて戻る）
    hatHint() {
      if (reduced) return;
      gsap
        .timeline()
        .to(p.hat, { y: -5, duration: 0.45, ease: "power2.out" })
        .to(p.hat, { y: 0, duration: 0.85, ease: "power2.inOut" }, "+=0.12");
    },
    mouthSmile(on) {
      gsap.to(p.mouthSmile, { opacity: on ? 1 : 0, duration: 0.28, ease: "power1.inOut" });
    },
    destroy() {
      gsap.killTweensOf([p.pupilL, p.pupilR, p.hat, p.mouthSmile, p.mouthNormal]);
    },
  };
}

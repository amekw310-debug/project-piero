// Part 2 レイヤーPIERO の制御。
// 構成: piero-no-hat(=piero.png の帽子除去版) + piero-hat(本物の帽子) + 瞳。
// すべて同一キャンバス・同一座標の完全一致 overlay（CSSで個別位置補正しない）。
// - 0:14: piero.png → v2 へごく短いクロスフェード（位置/大きさ/明るさ/輪郭は不変）。
// - THRILL: 帽子レイヤーだけを上方向へ僅かに移動（拡大縮小・回転なし）→ 離れたら元位置へ。
// - 瞳: piero-no-hat から切り出し。静止時は完全一致、視線追従で数pxのみ移動。

import gsap from "gsap";
import type { StageRefs } from "./stage";
import { assetUrl } from "./config";

export interface PartsApi {
  revealV2(): void;
  pupilTrack(nx: number, ny: number): void;
  pupilReverseThenCorrect(nx: number, ny: number): void;
  liftHat(dur?: number): void;
  settleHat(dur?: number): void;
  hatHint(): void;
  destroy(): void;
}

export function setupParts(refs: StageRefs, reduced: boolean): PartsApi {
  const { pieroImg, pieroV2, parts } = refs;

  parts.pupilL.style.backgroundImage = `url("${assetUrl("piero-pupil-l.png")}")`;
  parts.pupilR.style.backgroundImage = `url("${assetUrl("piero-pupil-r.png")}")`;
  gsap.set([parts.pupilL, parts.pupilR], { xPercent: -50, yPercent: -50, x: 0, y: 0 });
  gsap.set(parts.hat, { yPercent: 0 });

  // 瞳の最大移動はコンテナ幅基準（PC/スマホ同比率）。ごく僅か。
  const cw = refs.piero.getBoundingClientRect().width || 1350;
  const MAXX = cw * 0.0026;
  const MAXY = cw * 0.0018;

  const d = 0.55;
  const lx = gsap.quickTo(parts.pupilL, "x", { duration: d, ease: "power2" });
  const ly = gsap.quickTo(parts.pupilL, "y", { duration: d, ease: "power2" });
  const rx = gsap.quickTo(parts.pupilR, "x", { duration: d, ease: "power2" });
  const ry = gsap.quickTo(parts.pupilR, "y", { duration: d, ease: "power2" });

  return {
    // 0:14 の切替: v2 を出し piero.png を引く。両者は視覚的に同一なので不可視。
    revealV2() {
      if (reduced) {
        gsap.set(pieroV2, { opacity: 1 });
        gsap.set(pieroImg, { opacity: 0 });
        return;
      }
      gsap.to(pieroV2, { opacity: 1, duration: 0.32, ease: "power1.inOut" });
      gsap.to(pieroImg, { opacity: 0, duration: 0.32, ease: "power1.inOut" });
    },
    pupilTrack(nx, ny) {
      if (reduced) return;
      lx(nx * MAXX);
      ly(ny * MAXY);
      rx(nx * MAXX);
      ry(ny * MAXY);
    },
    // ODD: 右目が一瞬だけ逆方向 → 本来方向へ戻す
    pupilReverseThenCorrect(nx, ny) {
      if (reduced) return;
      gsap
        .timeline()
        .to(parts.pupilR, { x: -nx * MAXX - MAXX * 0.8, y: -ny * MAXY, duration: 0.14, ease: "power2.out" })
        .to(parts.pupilR, { x: nx * MAXX, y: ny * MAXY, duration: 0.5, ease: "power2.inOut" }, "+=0.12");
    },
    // THRILL: 帽子だけ上へ「フワッ」。移動量は PIERO本体サイズ基準の相対量(yPercent=
    // コンテナ高の%)＝PC/スマホとも比例。上方向のみ・拡大縮小・回転・左右移動なし。
    liftHat(dur = 0.42) {
      gsap.to(parts.hat, { yPercent: -2.5, duration: dur, ease: "power2.out" });
    },
    settleHat(dur = 0.5) {
      gsap.to(parts.hat, { yPercent: 0, duration: dur, ease: "power2.inOut" }); // 正確に元位置へ
    },
    hatHint() {
      if (reduced) return;
      gsap
        .timeline()
        .to(parts.hat, { yPercent: -1.2, duration: 0.42, ease: "power2.out" })
        .to(parts.hat, { yPercent: 0, duration: 0.6, ease: "power2.inOut" }, "+=0.12");
    },
    destroy() {
      gsap.killTweensOf([parts.pupilL, parts.pupilR, parts.hat]);
    },
  };
}

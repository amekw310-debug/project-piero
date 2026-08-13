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
  oddEyeFlare(): void;
  oddEyeCalm(): void;
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

  // 帽子の Y 基準（yPercent = コンテナ高の%）。
  //  HAT_REST : 通常時の基準位置。最新の piero-no-hat / piero-hat は同一座標で
  //             重ねると帽子下端が頭頂部へ自然に接するよう作られているため 0（=素材のまま）。
  //  HAT_LIFT : THRILL 時の「追加」上昇量（基準からの相対。浮遊距離・速度は従来のまま）。
  //  HAT_HINT : 待機ヒントの追加上昇量。
  const HAT_REST = 0;
  const HAT_LIFT = -12;
  const HAT_HINT = -3;
  gsap.set(parts.hat, { yPercent: HAT_REST });

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
    // ODD: 右目ホバー時に「奥から漏れる」青〜シアンの強い発光。
    //   入り: 約0.2秒で一度強く（少しまぶしい）→ 約0.42秒で落ち着いた青発光へ。
    //   ホラー的な点滅はせず、瞳の反射(p-eye--r)も僅かに拾わせて自然に。
    oddEyeFlare() {
      const glow = refs.p2.oddEyeGlow;
      const eye = refs.eyes.right;
      gsap.killTweensOf([glow, eye]);
      if (reduced) {
        gsap.set(glow, { opacity: 0.6, scale: 1 });
        gsap.set(eye, { opacity: 0.5 });
        return;
      }
      gsap
        .timeline()
        .fromTo(
          glow,
          { opacity: 0, scale: 0.82 },
          { opacity: 1, scale: 1.06, duration: 0.2, ease: "power2.out" }
        )
        .to(glow, { opacity: 0.62, scale: 1, duration: 0.42, ease: "power2.inOut" });
      // 白目/虹彩の反射ハイライトも一段強める（真っ白には飛ばさない）
      gsap.fromTo(eye, { opacity: 0 }, { opacity: 0.55, duration: 0.22, ease: "power2.out" });
    },
    oddEyeCalm() {
      const glow = refs.p2.oddEyeGlow;
      const eye = refs.eyes.right;
      gsap.killTweensOf([glow, eye]);
      if (reduced) {
        gsap.set(glow, { opacity: 0 });
        gsap.set(eye, { opacity: 0 });
        return;
      }
      gsap.to(glow, { opacity: 0, scale: 0.9, duration: 0.4, ease: "power2.out" });
      gsap.to(eye, { opacity: 0, duration: 0.4, ease: "power2.out" });
    },
    // THRILL: 帽子だけ上へ「フワッ」と大きく浮く。通常時の基準(HAT_REST)から
    // 一定量(HAT_LIFT)だけ上昇する＝浮遊距離・速度・ease は従来のまま。
    // 移動量は PIERO本体サイズ基準の相対量(yPercent=コンテナ高の%)＝PC/スマホとも比例。
    // 上方向のみ・拡大縮小・回転・左右移動なし。帽子上部が画角外へ出るのは許容（浮遊優先）。
    liftHat(dur = 0.42) {
      gsap.to(parts.hat, { yPercent: HAT_REST + HAT_LIFT, duration: dur, ease: "power2.out" });
    },
    settleHat(dur = 0.5) {
      gsap.to(parts.hat, { yPercent: HAT_REST, duration: dur, ease: "power2.inOut" }); // 正確に通常位置へ
    },
    hatHint() {
      if (reduced) return;
      gsap
        .timeline()
        .to(parts.hat, { yPercent: HAT_REST + HAT_HINT, duration: 0.42, ease: "power2.out" })
        .to(parts.hat, { yPercent: HAT_REST, duration: 0.6, ease: "power2.inOut" }, "+=0.12");
    },
    destroy() {
      gsap.killTweensOf([parts.pupilL, parts.pupilR, parts.hat, refs.p2.oddEyeGlow, refs.eyes.right]);
    },
  };
}

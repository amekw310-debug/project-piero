// OPENING 終了後の「生きている遊園地」演出。
// Tier 0 素材（park.png / piero.png）だけで可能な範囲に限定し、動かしすぎない。
//  - 背景ネオンのごく小さな明滅
//  - PIERO の呼吸（極小の上下＋スケール）
//  - 背景と PIERO のわずかな視差（パララックス）

import gsap from "gsap";
import type { StageRefs } from "./stage";
import { NEON_SPOTS } from "./config";

export function startAmbient(refs: StageRefs, reduced: boolean): () => void {
  if (reduced) {
    // モーション低減設定では静かな最終状態を保つ（追加のアニメはしない）。
    return () => {};
  }

  const tweens: gsap.core.Tween[] = [];

  // PIERO の呼吸（ごく僅か）
  gsap.set(refs.piero, { transformOrigin: "50% 50%" });
  tweens.push(
    gsap.to(refs.piero, {
      y: "+=7",
      scale: 1.014,
      duration: 4.2,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
    })
  );

  // 背景ネオンの微かな明滅
  NEON_SPOTS.forEach((s) => {
    const el = refs.neon[s.id];
    tweens.push(
      gsap.to(el, {
        opacity: gsap.utils.random(0.8, 0.92),
        duration: gsap.utils.random(1.4, 2.8),
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: gsap.utils.random(0, 1.5),
      })
    );
  });

  // 背景と PIERO のわずかな視差
  const parkX = gsap.quickTo(refs.parkImg, "x", { duration: 0.7, ease: "power2" });
  const parkY = gsap.quickTo(refs.parkImg, "y", { duration: 0.7, ease: "power2" });
  const pieroX = gsap.quickTo(refs.piero, "x", { duration: 0.9, ease: "power2" });

  const onMove = (e: PointerEvent): void => {
    const nx = (e.clientX / window.innerWidth - 0.5) * 2;
    const ny = (e.clientY / window.innerHeight - 0.5) * 2;
    parkX(-nx * 12);
    parkY(-ny * 8);
    pieroX(-nx * 5);
  };
  window.addEventListener("pointermove", onMove, { passive: true });

  return () => {
    window.removeEventListener("pointermove", onMove);
    tweens.forEach((t) => t.kill());
  };
}

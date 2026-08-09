// Chapter 1 / WELCOME — Part 2 WAITING & DISCOVERY
//
// 設計: 静止 → 違和感 → 発見 → 試す → 反応する。
//   - PIERO は大きく動かさない（呼吸・視差・周期的な瞬きは ambient.ts / blink.ts）。
//   - 4つの部位（帽子/左目/右目/口）にホバー(PC) または タップ(スマホ)で
//     各エリアの「予告」を出す（THRILL / JOY / ODD / MYSTERY）。
//   - PC: hover で予告 / スマホ: 1回目タップ=予告, 2回目タップ=仮選択（Part 3 へは遷移しない）。
//
// 素材制約により未実装の点は report で説明（瞳のカーソル追従・帽子の独立フロート等）。

import gsap from "gsap";
import type { StageRefs } from "./stage";
import type { Area } from "./config";
import { playBlink } from "./blink";

const AREAS: Area[] = ["thrill", "joy", "odd", "mystery"];

export function startDiscovery(refs: StageRefs, reduced: boolean): () => void {
  const p2 = refs.p2;
  const coarse = window.matchMedia("(hover: none), (pointer: coarse)").matches;

  const cleanups: Array<() => void> = [];
  const visited = new Set<Area>();
  const previewed = new Set<Area>(); // スマホ: 1回目タップ済みか
  let allDone = false;
  let blinking = false;
  const timers: number[] = [];

  refs.stage.classList.add("p2-ready"); // ホットスポットを有効化

  // NOTE: 帽子/口/瞳の実パーツ overlay は座標系不一致でスマホ崩れが出たため無効化。
  //       素材を「元PIEROと同一キャンバス・同一座標」の透過PNGで作り直したのち、
  //       inset:0 / width:100% / height:100% の完全一致 overlay として再導入する。
  //       ここでは予告演出（ラベル/照明/紙吹雪/霧/歪み/レール）と瞬きのみを行う。

  // --- 周期的な瞬き（数秒〜十数秒に一度） ---
  const doBlink = (): void => {
    if (blinking || reduced) return;
    blinking = true;
    playBlink(refs).eventCallback("onComplete", () => {
      blinking = false;
    });
  };
  const scheduleBlink = (): void => {
    const t = window.setTimeout(() => {
      doBlink();
      scheduleBlink();
    }, gsap.utils.random(6000, 13000));
    timers.push(t);
  };
  if (!reduced) scheduleBlink();

  // --- 最初のヒント（5〜6秒、何も発見されなければ） ---
  // 帽子パーツは無効化中のため、帽子付近の淡い明滅で「そこに何かある」を示す。
  let hintTimer = window.setTimeout(() => {
    if (visited.size === 0 && !reduced) {
      gsap
        .timeline()
        .to(p2.glows.thrill, { opacity: 0.5, duration: 0.5, ease: "power2.out" })
        .to(p2.glows.thrill, { opacity: 0, duration: 0.9, ease: "power2.in" }, "+=0.15");
    }
  }, 5500);
  timers.push(hintTimer);

  const markVisited = (area: Area): void => {
    if (hintTimer) {
      clearTimeout(hintTimer);
      hintTimer = 0;
    }
    visited.add(area);
    if (visited.size >= AREAS.length && !allDone) {
      allDone = true;
      allFour();
    }
  };

  // --- ラベル表示（MYSTERY は最も遅く静かに） ---
  const showLabel = (area: Area): void => {
    const el = p2.labels[area];
    const slow = area === "mystery";
    gsap.killTweensOf(el);
    if (area === "odd") oddReversal();
    gsap.fromTo(
      el,
      { opacity: 0, y: slow ? 10 : 14 },
      { opacity: 1, y: 0, duration: slow ? 1.1 : 0.5, ease: "power2.out", delay: slow ? 0.35 : 0 }
    );
  };
  const hideLabel = (area: Area): void => {
    const el = p2.labels[area];
    gsap.killTweensOf(el);
    gsap.to(el, { opacity: 0, duration: 0.35, ease: "power1.out" });
  };

  const showGlow = (area: Area): void => {
    gsap.to(p2.glows[area], { opacity: 1, duration: 0.5, ease: "power2.out" });
  };
  const hideGlow = (area: Area): void => {
    gsap.to(p2.glows[area], { opacity: 0, duration: 0.6, ease: "power1.out" });
  };

  // --- ODD: DDO → ODD の反転 ---
  const oddReversal = (): void => {
    if (reduced) {
      p2.oddText.textContent = "ODD";
      return;
    }
    p2.oddText.textContent = "DDO";
    gsap.fromTo(p2.oddText, { scaleX: -1 }, { scaleX: -1, duration: 0.32 });
    const t = window.setTimeout(() => {
      p2.oddText.textContent = "ODD";
      gsap.fromTo(p2.oddText, { scaleX: -1 }, { scaleX: 1, duration: 0.4, ease: "back.out(2)" });
    }, 320);
    timers.push(t);
  };

  // --- JOY: 紙吹雪 ---
  const confettiBurst = (): void => {
    if (reduced) return;
    const colors = ["#ffd23f", "#ff5ea8", "#ff9f40", "#5ad1ff", "#8affc1"];
    for (let i = 0; i < 14; i++) {
      const bit = document.createElement("i");
      bit.className = "confetti-bit";
      bit.style.background = colors[i % colors.length];
      bit.style.left = `${gsap.utils.random(18, 46)}%`;
      p2.confetti.appendChild(bit);
      gsap.fromTo(
        bit,
        { y: -20, x: 0, rotation: 0, opacity: 1 },
        {
          y: gsap.utils.random(220, 420),
          x: gsap.utils.random(-40, 120),
          rotation: gsap.utils.random(180, 720),
          opacity: 0,
          duration: gsap.utils.random(1.3, 2.2),
          ease: "power1.in",
          onComplete: () => bit.remove(),
        }
      );
    }
  };

  // --- THRILL: 遠くをコースターが横切る（光の帯） ---
  const railStreak = (): void => {
    if (reduced) return;
    gsap.fromTo(
      p2.rail,
      { xPercent: -30, opacity: 0 },
      {
        xPercent: 130,
        opacity: 1,
        duration: 1.1,
        ease: "power2.in",
        onComplete: () => gsap.to(p2.rail, { opacity: 0, duration: 0.2 }),
      }
    );
  };

  // --- ODD: ミラーハウスの歪み（画面右側の波打ち・仮） ---
  const oddRipple = (): void => {
    if (reduced) return;
    gsap
      .timeline()
      .fromTo(p2.ripple, { opacity: 0, skewX: 0 }, { opacity: 0.5, skewX: 4, duration: 0.18, ease: "power1.inOut" })
      .to(p2.ripple, { skewX: -3, duration: 0.16, ease: "power1.inOut" })
      .to(p2.ripple, { skewX: 0, opacity: 0, duration: 0.5, ease: "power1.out" });
  };

  // --- MYSTERY: 霧 ---
  const fogIn = (): void => {
    gsap.to(p2.fog, { opacity: reduced ? 0.5 : 0.75, duration: 1.1, ease: "power2.out" });
  };
  const fogOut = (): void => {
    gsap.to(p2.fog, { opacity: 0, duration: 0.9, ease: "power1.out" });
  };

  // --- エリアの予告 ON / OFF（パーツ無効化中＝照明・粒子・文字のみ） ---
  const activate = (area: Area): void => {
    markVisited(area);
    showLabel(area);
    showGlow(area);
    if (area === "thrill") railStreak();
    if (area === "joy") confettiBurst();
    if (area === "odd") oddRipple();
    if (area === "mystery") fogIn();
  };
  const deactivate = (area: Area): void => {
    hideLabel(area);
    hideGlow(area);
    if (area === "mystery") fogOut();
  };

  // --- 4つすべてを触った後: CHOOSE が一度だけ微かに光り、PIERO が一度瞬き ---
  function allFour(): void {
    doBlink();
    gsap
      .timeline()
      .to(refs.choose, { opacity: 1, duration: 0.3, ease: "power2.out" })
      .to(refs.choose, { textShadow: "0 0 22px rgba(255,200,120,0.95), 0 0 40px rgba(255,90,70,0.6)", duration: 0.4, yoyo: true, repeat: 1 })
      .to(refs.choose, { clearProps: "textShadow", duration: 0.01 });
  }

  // --- スマホ: 2回目タップ = 仮選択（Part 3 へは遷移しない） ---
  const placeholderSelect = (area: Area): void => {
    const label = p2.labels[area];
    gsap.fromTo(label, { scale: 1 }, { scale: 1.12, duration: 0.16, yoyo: true, repeat: 1, ease: "power2.inOut", transformOrigin: "50% 50%" });
    gsap.fromTo(p2.glows[area], { opacity: 1 }, { opacity: 0.4, duration: 0.2, yoyo: true, repeat: 1 });
    // Part 3 は未実装のためここで停止（選択されたエリアだけ記録）。
    refs.stage.setAttribute("data-selected", area);
  };

  // --- 入力ハンドラの配線 ---
  AREAS.forEach((area) => {
    const el = p2.hotspots[area];
    if (!coarse) {
      // PC: hover / focus で予告
      const on = (): void => activate(area);
      const off = (): void => deactivate(area);
      el.addEventListener("pointerenter", on);
      el.addEventListener("pointerleave", off);
      el.addEventListener("focus", on);
      el.addEventListener("blur", off);
      cleanups.push(() => {
        el.removeEventListener("pointerenter", on);
        el.removeEventListener("pointerleave", off);
        el.removeEventListener("focus", on);
        el.removeEventListener("blur", off);
      });
    } else {
      // スマホ: 1回目タップ=予告, 2回目タップ=仮選択
      const onClick = (): void => {
        if (!previewed.has(area)) {
          AREAS.forEach((a) => {
            if (a !== area && previewed.has(a)) {
              previewed.delete(a);
              deactivate(a);
            }
          });
          previewed.add(area);
          activate(area);
        } else {
          placeholderSelect(area);
        }
      };
      el.addEventListener("click", onClick);
      cleanups.push(() => el.removeEventListener("click", onClick));
    }
  });

  return () => {
    timers.forEach((t) => clearTimeout(t));
    cleanups.forEach((c) => c());
    refs.stage.classList.remove("p2-ready");
    AREAS.forEach((area) => gsap.killTweensOf([p2.labels[area], p2.glows[area]]));
    gsap.killTweensOf([p2.fog, p2.ripple, p2.rail]);
  };
}

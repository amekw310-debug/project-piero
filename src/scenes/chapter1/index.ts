import "../../styles/chapter1.css";
import type { Scene } from "../types";
import { buildStage, type StageRefs } from "./stage";
import { createOpeningTimeline, applyFinalState } from "./openingTimeline";
import { startAmbient } from "./ambient";

/**
 * Chapter 1 / WELCOME — Part 1 OPENING（0:00〜0:14）。
 *
 * 構成:
 *   stage.ts           … レイヤー構造の DOM（park / piero を独立レイヤーで保持）
 *   openingTimeline.ts … GSAP のオープニング演出
 *   ambient.ts         … 終了後の「生きている遊園地」
 *
 * Part 2（WAITING & DISCOVERY）はまだ実装しない。
 */
export class Chapter1 implements Scene {
  readonly id = "chapter1";

  private refs: StageRefs | null = null;
  private timeline: ReturnType<typeof createOpeningTimeline> | null = null;
  private stopAmbient: (() => void) | null = null;
  private detachKeys: (() => void) | null = null;

  mount(root: HTMLElement): void {
    const refs = buildStage(root);
    this.refs = refs;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      // モーション低減: 演出を飛ばして点灯後の状態を提示する。
      applyFinalState(refs);
      this.stopAmbient = startAmbient(refs, true);
      return;
    }

    this.timeline = createOpeningTimeline(refs, () => {
      this.stopAmbient = startAmbient(refs, false);
    });

    // デバッグ用シーク（?debug 付きURLのときのみタイムラインを公開）。通常は非公開。
    if (new URLSearchParams(window.location.search).has("debug")) {
      (window as unknown as { __pieroTL?: unknown }).__pieroTL = this.timeline;
    }

    // アクセシビリティ用の控えめなスキップ（Esc / Enter で終端へ）。
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape" || e.key === "Enter") {
        this.timeline?.progress(1);
      }
    };
    window.addEventListener("keydown", onKey);
    this.detachKeys = () => window.removeEventListener("keydown", onKey);
  }

  destroy(): void {
    this.timeline?.kill();
    this.timeline = null;
    this.stopAmbient?.();
    this.stopAmbient = null;
    this.detachKeys?.();
    this.detachKeys = null;
    this.refs?.root.replaceChildren();
    this.refs = null;
  }
}

export default Chapter1;

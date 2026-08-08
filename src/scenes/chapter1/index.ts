import gsap from "gsap";
import type { Scene } from "../types";

/**
 * Chapter 1 のシーン（土台の空シーン）。
 *
 * 現段階はプレビュー確認用のプレースホルダのみ。
 * 本格的な演出（視差レイヤー・スクロール連動など）はまだ実装しない。
 *
 * 2.5D → 3D への発展を見据え、演出は必ず GSAP のタイムラインに集約する。
 * ここでは導入確認のためタイトルのフェードインだけを行う。
 */
export class Chapter1 implements Scene {
  readonly id = "chapter1";

  private timeline: gsap.core.Timeline | null = null;

  mount(root: HTMLElement): void {
    const section = document.createElement("section");
    section.className = "chapter";
    section.dataset.chapter = this.id;

    // 視差レイヤーの置き場所（実装時に background-image を割り当てる）。
    // 背景 / 中景 / 前景の3層をあらかじめ用意しておく。
    const layerBack = document.createElement("div");
    layerBack.className = "layer layer--back";
    const layerMid = document.createElement("div");
    layerMid.className = "layer layer--mid";
    const layerFront = document.createElement("div");
    layerFront.className = "layer layer--front";

    const placeholder = document.createElement("div");
    placeholder.className = "chapter__placeholder";
    placeholder.innerHTML = `
      <h1>PROJECT PIERO</h1>
      <p>Chapter 1 &mdash; scaffold ready (演出は未実装)</p>
    `;

    section.append(layerBack, layerMid, layerFront, placeholder);
    root.appendChild(section);

    // GSAP 動作確認用の最小アニメーション。
    this.timeline = gsap.timeline();
    this.timeline.from(placeholder, {
      opacity: 0,
      y: 24,
      duration: 1.2,
      ease: "power2.out",
    });
  }

  destroy(): void {
    this.timeline?.kill();
    this.timeline = null;
  }
}

export default Chapter1;

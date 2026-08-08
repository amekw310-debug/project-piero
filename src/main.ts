import "./styles/main.css";
import Chapter1 from "./scenes/chapter1";
import type { Scene } from "./scenes/types";

/**
 * エントリポイント。
 * 現段階では Chapter 1 を単純にマウントするだけ。
 * 章が増えたらここでルーティング / 章の切り替えを行う。
 */
const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error('Root element "#app" not found.');
}

const scene: Scene = new Chapter1();
scene.mount(app);

// Chapter 1 / WELCOME — OPENING の設定値（タイミング・レイアウト・アセット）
// 演出のタイミングやパーツ位置はここに集約し、タイムライン側はデータ駆動にする。

/** public/assets/chapter1/ 配下のアセットURL（Vite の base を自動付与） */
export const assetUrl = (name: string): string =>
  `${import.meta.env.BASE_URL}assets/chapter1/${name}`;

/** piero.png のアスペクト比（1536 x 1024）。パーツ位置(%)はこの画像基準で揃える。 */
export const PIERO_ASPECT_W = 1536;
export const PIERO_ASPECT_H = 1024;

/** 計測済みの瞳中心（画像に対する%）。将来ここへ実際の瞳パーツを差し替える。 */
export const PIERO_EYES = {
  left: { xPct: 42.4, yPct: 51.2 },
  right: { xPct: 57.3, yPct: 51.0 },
} as const;

/**
 * 遊園地ネオンの点灯スポット（park.png 上のおおよその位置）。
 * 現状は光のにじみ（CSS radial-gradient）で表現。
 * 将来は neon-*.png（透過）へ差し替えるためのアンカーとして機能する。
 * 配列の順序 = 点灯順（観覧車 → コースター → ミラーハウス → ゲート → 中央）。
 */
export interface NeonSpot {
  id: string;
  xPct: number;
  yPct: number;
  sizePct: number;
  color: string; // "r,g,b"
}
export const NEON_SPOTS: NeonSpot[] = [
  { id: "ferris", xPct: 13, yPct: 28, sizePct: 34, color: "255,60,150" },
  { id: "coaster", xPct: 85, yPct: 28, sizePct: 40, color: "255,80,60" },
  { id: "mirror", xPct: 85, yPct: 60, sizePct: 20, color: "230,60,200" },
  { id: "gate", xPct: 17, yPct: 56, sizePct: 18, color: "255,170,40" },
  { id: "carousel", xPct: 50, yPct: 55, sizePct: 22, color: "255,140,50" },
];

/** Part 2 の4エリア（触れる部位） */
export type Area = "thrill" | "joy" | "odd" | "mystery";

/** タイトル（電飾看板） */
export const TITLE_LINES = ["WELCOME TO", "PIERO", "THE PARK OF MANY FACES"];
export const CHOOSE_TEXT = "CHOOSE YOUR POINT OF VIEW.";

/**
 * OPENING タイムライン（秒）。ストーリーボードの 0:00〜0:14 に対応。
 */
export const T = {
  // 0:00–0:02 完全な黒
  blackHold: 2.0,
  // 0:02–0:04 遊園地が目覚める / ネオン点灯
  parkAt: 2.0,
  parkDur: 2.0,
  neonAt: [2.3, 2.7, 3.1, 3.4, 3.75], // NEON_SPOTS の順に対応
  reflAt: 3.0,
  reflDur: 1.6,
  // 0:04–0:07 スポットライト & PIERO 出現
  darkenAt: 4.2, // 背景を落として主役を際立たせる
  spotAt: 4.4,
  spotDur: 1.9,
  pieroAt: 4.6,
  pieroDur: 2.4, // 〜7.0
  // 0:07–0:09 一度だけの自然な瞬き（通常PIERO → 目閉じ → 通常PIERO の短いクロスフェード）
  blinkAt: 8.1,
  blinkIn: 0.15, // 目を閉じる
  blinkOut: 0.24, // 目を開ける（合計 ~0.4s）
  // 0:09–0:12 タイトル電飾
  titleAt: 9.0,
  titleGap: 1.0, // 9.0 / 10.0 / 11.0
  // 0:12–0:14 CHOOSE
  chooseAt: 12.2,
  chooseDur: 1.1,
  // 0:14 終了
  endAt: 14.0,
} as const;

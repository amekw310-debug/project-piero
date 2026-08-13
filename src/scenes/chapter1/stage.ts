// OPENING のステージ（レイヤー構造）を構築する。
// - park.png と piero.png は独立レイヤーとして扱う（1枚に合成しない）。
// - 将来、観覧車・ネオン・瞳・帽子・口などを個別パーツへ差し替えられるよう
//   アンカー（data-part / data-neon）と %ベースの配置を用意している。

import { assetUrl, NEON_SPOTS, TITLE_LINES, CHOOSE_TEXT, type Area } from "./config";

export interface StageRefs {
  root: HTMLElement;
  stage: HTMLElement;
  parkImg: HTMLImageElement;
  parkDark: HTMLElement;
  neon: Record<string, HTMLElement>;
  reflection: HTMLElement;
  spotlight: HTMLElement;
  vignette: HTMLElement;
  titleScrim: HTMLElement;
  piero: HTMLElement;
  pieroImg: HTMLImageElement;
  pieroV2: HTMLElement;
  pieroBlink: HTMLImageElement;
  parts: { hat: HTMLElement; pupilL: HTMLElement; pupilR: HTMLElement };
  eyes: { left: HTMLElement; right: HTMLElement };
  titleLines: HTMLElement[];
  choose: HTMLElement;
  blackout: HTMLElement;
  p2: {
    hotspots: Record<Area, HTMLElement>;
    labels: Record<Area, HTMLElement>;
    glows: Record<Area, HTMLElement>;
    fog: HTMLElement;
    ripple: HTMLElement;
    rail: HTMLElement;
    confetti: HTMLElement;
    oddText: HTMLElement;
    oddEyeGlow: HTMLElement;
    joyEyeGlow: HTMLElement;
    joyEyeFlare: HTMLElement;
  };
}

const esc = (s: string): string =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** 1行を「単語 > 文字」に分割し、電飾看板のように個別点灯できるようにする。 */
function splitLine(text: string): string {
  return text
    .split(" ")
    .map(
      (word) =>
        `<span class="ttl__word">${Array.from(word)
          .map((ch) => `<span class="seg">${esc(ch)}</span>`)
          .join("")}</span>`
    )
    .join(" ");
}

export function buildStage(root: HTMLElement): StageRefs {
  const neonMarkup = NEON_SPOTS.map(
    (s) =>
      `<div class="neon" data-neon="${s.id}" style="--nx:${s.xPct}%;--ny:${s.yPct}%;--nsize:${s.sizePct}%;--ncol:${s.color}"></div>`
  ).join("");

  const titlesMarkup = TITLE_LINES.map(
    (line, i) => `<div class="ttl__line ttl--${i + 1}">${splitLine(line)}</div>`
  ).join("");

  root.innerHTML = `
  <div class="piero-stage" data-scene="chapter1-opening">
    <!-- 背景レイヤー: 夜の遊園地 (park.png)。将来: 観覧車/コースター/ネオン等を個別レイヤーへ -->
    <div class="layer layer--park">
      <img class="park-img" src="${assetUrl("park.png")}" alt="" draggable="false" />
    </div>
    <div class="layer park-dark"></div>

    <!-- ネオン点灯レイヤー（park上の位置に対応 / 将来: 実ネオンPNGへ差し替え） -->
    <div class="layer layer--neon">${neonMarkup}</div>
    <div class="layer reflection"></div>

    <!-- スポットライトの光溜まり（PIEROの背後） -->
    <div class="layer spotlight"></div>

    <!-- 主役レイヤー: PIERO (piero.png, 透過)。将来: 帽子/髪/顔/鼻/瞳/口を個別パーツ化 -->
    <div class="piero">
      <!-- OPENING(0:00-0:14)の基準。現行 piero.png のまま（変更しない）。 -->
      <img class="piero-img" src="${assetUrl("piero.png")}" alt="PIERO" draggable="false" />

      <!-- Part 2 レイヤーPIERO: piero-no-hat(=piero.png の帽子除去版) + 帽子 + 瞳。
           すべて同一キャンバス・同一座標の完全一致 overlay（CSSでの個別位置補正なし）。
           0:14で piero.png からここへごく短くクロスフェード（初期 opacity:0）。 -->
      <div class="piero-v2">
        <img class="pv2-img pv2-body" src="${assetUrl("piero-no-hat.png")}" alt="" draggable="false" />
        <!-- 瞳（虹彩＋黒目。piero-no-hat から切り出し＝完全一致）。視線追従で数pxのみ移動。 -->
        <div class="pv2-pupil pv2-pupil--l" data-part="pupil-left"></div>
        <div class="pv2-pupil pv2-pupil--r" data-part="pupil-right"></div>
        <!-- 帽子（piero.png 本来の帽子ピクセル）。THRILLで上方向へ僅かに移動のみ（拡大縮小・回転なし）。 -->
        <img class="pv2-img pv2-hat" src="${assetUrl("piero-hat.png")}" alt="" draggable="false" />
      </div>

      <!-- 瞬き: 目閉じPIERO（piero.png=piero-no-hat と同一座標）。OPENINGとPart2の両方を覆う。 -->
      <img class="piero-img piero-blink" src="${assetUrl("piero-eyes-closed.png")}" alt="" draggable="false" />

      <!-- ODD: 右目ホバー時に「目の奥から漏れる」青〜シアンの発光。顔に追従するよう .piero 内。
           虹彩コア→瞳外周グロー→周囲の顔への淡い青ハローを screen で重ねる（初期 opacity:0）。 -->
      <div class="p2-eyeglow p2-eyeglow--odd" aria-hidden="true"></div>

      <!-- JOY: 左目ホバー時に瞳がライトブルーへ強く発光。中心＝左目の虹彩に一致（%基準）。
           中心の強い光＋外側の柔らかい光の多段グローと、瞳中心を通る横フレアを screen で重ねる。 -->
      <div class="p2-eyeflare p2-eyeflare--joy" aria-hidden="true"></div>
      <div class="p2-eyeglow p2-eyeglow--joy" aria-hidden="true"></div>

      <div class="piero__parts" aria-hidden="true">
        <div class="p-eye p-eye--l" data-part="pupil-left"></div>
        <div class="p-eye p-eye--r" data-part="pupil-right"></div>
        <!-- 将来ここに hat / mouth / brow などのパーツを追加 -->
      </div>
      <!-- Part 2: 触れる部位のホットスポット（顔に追従するよう .piero 内に配置） -->
      <div class="p2-hotspots">
        <button type="button" class="hot hot--hat" data-area="thrill" aria-label="THRILL"></button>
        <button type="button" class="hot hot--eyeL" data-area="joy" aria-label="JOY"></button>
        <button type="button" class="hot hot--eyeR" data-area="odd" aria-label="ODD"></button>
        <button type="button" class="hot hot--mouth" data-area="mystery" aria-label="MYSTERY"></button>
      </div>
    </div>

    <div class="layer vignette"></div>

    <!-- タイトル可読性のための控えめなスクリム -->
    <div class="layer title-scrim"></div>
    <!-- タイトル電飾 -->
    <div class="layer layer--titles">${titlesMarkup}</div>
    <div class="choose">${esc(CHOOSE_TEXT)}</div>

    <!-- Part 2: エリアごとの予告演出（照明・霧・紙吹雪・歪み・レール） -->
    <div class="layer p2-fx" aria-hidden="true">
      <div class="p2-glow p2-glow--thrill"></div>
      <div class="p2-glow p2-glow--joy"></div>
      <div class="p2-glow p2-glow--odd"></div>
      <div class="p2-glow p2-glow--mystery"></div>
      <div class="p2-rail"></div>
      <div class="p2-ripple"></div>
      <div class="p2-fog"></div>
      <div class="p2-confetti"></div>
    </div>
    <!-- Part 2: エリア名（ホバー/タップで初めて出る予告ラベル） -->
    <div class="layer p2-labels">
      <div class="p2-label p2-label--thrill">THRILL</div>
      <div class="p2-label p2-label--joy">JOY</div>
      <div class="p2-label p2-label--odd"><span class="p2-odd">ODD</span></div>
      <div class="p2-label p2-label--mystery">MYSTERY</div>
    </div>

    <!-- 開幕前の暗転 -->
    <div class="layer blackout"></div>
  </div>`;

  const q = <T extends Element>(sel: string): T => {
    const el = root.querySelector(sel);
    if (!el) throw new Error(`Stage element not found: ${sel}`);
    return el as T;
  };

  const neon: Record<string, HTMLElement> = {};
  NEON_SPOTS.forEach((s) => {
    neon[s.id] = q<HTMLElement>(`.neon[data-neon="${s.id}"]`);
  });

  return {
    root,
    stage: q<HTMLElement>(".piero-stage"),
    parkImg: q<HTMLImageElement>(".park-img"),
    parkDark: q<HTMLElement>(".park-dark"),
    neon,
    reflection: q<HTMLElement>(".reflection"),
    spotlight: q<HTMLElement>(".spotlight"),
    vignette: q<HTMLElement>(".vignette"),
    titleScrim: q<HTMLElement>(".title-scrim"),
    piero: q<HTMLElement>(".piero"),
    pieroImg: q<HTMLImageElement>(".piero-img:not(.piero-blink)"),
    pieroV2: q<HTMLElement>(".piero-v2"),
    pieroBlink: q<HTMLImageElement>(".piero-blink"),
    parts: {
      hat: q<HTMLElement>(".pv2-hat"),
      pupilL: q<HTMLElement>(".pv2-pupil--l"),
      pupilR: q<HTMLElement>(".pv2-pupil--r"),
    },
    eyes: { left: q<HTMLElement>(".p-eye--l"), right: q<HTMLElement>(".p-eye--r") },
    titleLines: Array.from(root.querySelectorAll(".ttl__line")) as HTMLElement[],
    choose: q<HTMLElement>(".choose"),
    blackout: q<HTMLElement>(".blackout"),
    p2: {
      hotspots: {
        thrill: q<HTMLElement>(".hot--hat"),
        joy: q<HTMLElement>(".hot--eyeL"),
        odd: q<HTMLElement>(".hot--eyeR"),
        mystery: q<HTMLElement>(".hot--mouth"),
      },
      labels: {
        thrill: q<HTMLElement>(".p2-label--thrill"),
        joy: q<HTMLElement>(".p2-label--joy"),
        odd: q<HTMLElement>(".p2-label--odd"),
        mystery: q<HTMLElement>(".p2-label--mystery"),
      },
      glows: {
        thrill: q<HTMLElement>(".p2-glow--thrill"),
        joy: q<HTMLElement>(".p2-glow--joy"),
        odd: q<HTMLElement>(".p2-glow--odd"),
        mystery: q<HTMLElement>(".p2-glow--mystery"),
      },
      fog: q<HTMLElement>(".p2-fog"),
      ripple: q<HTMLElement>(".p2-ripple"),
      rail: q<HTMLElement>(".p2-rail"),
      confetti: q<HTMLElement>(".p2-confetti"),
      oddText: q<HTMLElement>(".p2-odd"),
      oddEyeGlow: q<HTMLElement>(".p2-eyeglow--odd"),
      joyEyeGlow: q<HTMLElement>(".p2-eyeglow--joy"),
      joyEyeFlare: q<HTMLElement>(".p2-eyeflare--joy"),
    },
  };
}

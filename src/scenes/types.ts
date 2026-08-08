/**
 * すべての Chapter シーンが実装する共通インターフェース。
 * Chapter を追加するときはこの Scene を満たすモジュールを scenes/chapterN/ に作る。
 */
export interface Scene {
  /** 章の識別子（例: "chapter1"） */
  readonly id: string;

  /**
   * シーンを DOM にマウントする。
   * @param root シーンを描画するルート要素
   */
  mount(root: HTMLElement): void;

  /**
   * シーンを破棄し、リスナーやアニメーションを解放する。
   * 章の切り替え時に呼ばれることを想定。
   */
  destroy?(): void;
}

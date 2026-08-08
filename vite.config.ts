import { defineConfig } from "vite";

// GitHub Pages でプロジェクトサイト（https://<user>.github.io/project-piero/）として
// 配信するため、base をリポジトリ名に合わせる。
export default defineConfig({
  base: "/project-piero/",
  build: {
    outDir: "dist",
    // アセット参照の追跡を明示。将来 Three.js の glTF などを扱う際もここを基準にする。
    assetsInlineLimit: 4096,
  },
  server: {
    open: true,
  },
});

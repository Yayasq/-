# 吹蜡烛生日交互页

这是一个可直接部署的纯前端静态网页。

## 文件结构

```text
.
├── index.html
├── app.js
├── styles.css
└── assets
    ├── 生日蛋糕.svg
    └── audio
        ├── 燃烧.mp3
        ├── strawberry.mp3
        ├── 0-脚步声.m4a
        └── 1-ei疑问.m4a
```

## 部署

把本文件夹中的所有内容上传到 GitHub 仓库根目录，然后可以用 Vercel 导入该仓库部署。

如果使用 GitHub Pages，进入仓库 `Settings -> Pages`，选择 `Deploy from a branch`，分支选择 `main`，目录选择 `/root`。

## 注意

浏览器可能禁止网页在用户未点击前自动播放有声音频。如果燃烧声没有立刻出现，需要先点击页面一次，这是浏览器策略限制。

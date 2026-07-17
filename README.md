# Codex FPS Lab

一个使用 **Vite + TypeScript + Three.js** 制作的浏览器 FPS 训练场原型。

这个项目记录了我使用 Codex 辅助开发 FPS 游戏的完整过程：从早期第三人称尝试，到先切回第一人称跑通核心玩法，再逐步拆分武器、目标、伤害、HUD、敌人等系统。

当前正式版本是 **v0.1.0**：第一人称核心玩法 + 武器系统 v1。

## 快速开始

如果你只是想下载并运行这个项目，可以按下面流程操作。

### 方式一：下载 ZIP

1. 点击 GitHub 页面右上方绿色的 **Code** 按钮。
2. 选择 **Download ZIP**。
3. 解压下载好的压缩包。
4. 用终端进入项目文件夹。
5. 安装依赖并启动项目：

```bash
npm install
npm run dev
```

6. 打开浏览器访问：

```text
http://127.0.0.1:5173/
```

### 方式二：使用 Git 克隆

```bash
git clone https://github.com/995286261-sketch/fps-codex-game.git
cd fps-codex-game
npm install
npm run dev
```

然后打开：

```text
http://127.0.0.1:5173/
```

## 游戏简介

`Codex FPS Lab` 目前是一个小型射击训练场。玩家可以在浏览器里进入第一人称视角，使用鼠标瞄准、键盘移动，并射击训练靶标获得分数。

项目目前重点不是商业级画面，而是先把射击游戏最重要的底层体验和工程结构搭好：

- 第一人称移动与鼠标视角
- 中心准星指哪打哪
- 命中训练靶标与计分反馈
- 跳跃、下蹲、静步
- 基础武器系统
- 可继续扩展的模块结构

## 当前功能

- 浏览器运行，无需后端。
- `WASD` 第一人称移动。
- 鼠标控制视角。
- 左键射击。
- `Space` 跳跃。
- `Ctrl` 下蹲。
- `Left Shift` 静步。
- 中央准星。
- 射线命中检测。
- 靶标命中、隐藏、重生。
- HUD 显示分数、命中提示和射击冷却。
- 武器数值从独立模块定义，方便后续添加更多枪械。

## 操作说明

进入页面后，点击画面锁定鼠标。

| 操作 | 按键 |
| --- | --- |
| 移动 | `W` `A` `S` `D` |
| 跳跃 | `Space` |
| 下蹲 | `Ctrl` |
| 静步 | `Left Shift` |
| 瞄准 | 鼠标移动 |
| 射击 | 鼠标左键 |
| 退出鼠标锁定 | `Esc` |

## 如何运行

### 环境要求

- Node.js 18 或更高版本
- npm

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

默认访问：

```text
http://127.0.0.1:5173/
```

### 构建项目

```bash
npm run build
```

### 预览构建结果

```bash
npm run preview
```

## 项目结构

```text
src/
  main.ts
  styles.css
  game/
    Game.ts
    SceneBuilder.ts
    PlayerController.ts
    Shooting.ts
    combat/
      DamageSystem.ts
      HitScanSystem.ts
      CombatTypes.ts
      WeaponDefinitions.ts
      WeaponController.ts
    effects/
      WeaponEffects.ts
    state/
      ScoreSystem.ts
    targets/
      TargetManager.ts
  ui/
    Hud.ts
```

### 关键模块

- `Game.ts`：游戏入口、主循环和系统组装。
- `SceneBuilder.ts`：训练场场景、灯光、地面、掩体、靶标。
- `PlayerController.ts`：玩家移动、跳跃、下蹲、静步、鼠标视角。
- `Shooting.ts`：中心准星射线、命中检测、射击反馈。
- `targets/TargetManager.ts`：靶标命中、隐藏和重生生命周期。
- `combat/DamageSystem.ts`：伤害计算和击毁判断。
- `combat/HitScanSystem.ts`：中心屏幕射线检测。
- `combat/WeaponDefinitions.ts`：武器静态数值。
- `combat/WeaponController.ts`：武器运行时状态和射击冷却。
- `effects/WeaponEffects.ts`：弹道线等武器视觉反馈。
- `state/ScoreSystem.ts`：分数状态。
- `ui/Hud.ts`：分数、命中提示、冷却状态和准星。

更详细的架构说明见 `ARCHITECTURE.md`。

## 开发原则

这个项目会尽量遵守以下规则：

- 先做小而完整的可玩闭环，再扩展复杂功能。
- 不把所有逻辑堆进一个文件。
- 武器、目标、伤害、输入、HUD、特效、游戏状态逐步拆成独立模块。
- 每完成一个稳定阶段再打版本 tag。
- GitHub 上保留项目的成长过程，方便复盘和教学。

## 后续计划

- 目标/敌人系统 v1。
- 伤害系统与生命值系统。
- 多武器切换。
- 弹药、换弹、后坐力和散布。
- 命中特效、枪口火焰、音效。
- 简单敌人 AI。
- 训练关卡目标与结算界面。
- 在第一人称核心稳定后，再重新探索第三人称版本。

## 版本展示

### v0.1.0 - First Playable FPS Core

当前第一个正式版本。

包含内容：

- 第一人称核心控制。
- 鼠标瞄准。
- 中心准星射击。
- 训练靶标命中反馈。
- 分数 HUD。
- 跳跃、下蹲、静步。
- 武器系统 v1。

这个版本的意义是：项目已经从早期视角探索，进入可以继续扩展的 FPS 核心玩法阶段。

---

更多版本会在后续开发完成阶段成果后继续添加。

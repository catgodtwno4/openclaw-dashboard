# OpenClaw 儀表板

> OpenClaw 系統狀態監控儀表板 — 即時查看 Agent、記憶體、任務、健康狀態。

## 這是什麼

一個基於 Next.js + Tailwind CSS 的 Web 儀表板，搭配 Python API 後端，用於監控 OpenClaw 系統的各項指標：

- 🤖 Agent 狀態（在線、離線、任務中）
- 🧠 記憶體使用（LCM summaries、MemOS、Cognee）
- 📋 任務追蹤（todo.md 同步顯示）
- 🔧 系統健康（Gateway、磁碟、進程）
- 📊 Cron 任務執行記錄

## 技術棧

| 層 | 技術 | 說明 |
|----|------|------|
| 前端 | Next.js 15 + Tailwind CSS | React Server Components |
| 後端 | Python FastAPI | 讀取 OpenClaw 狀態 |
| 資料源 | SQLite + Markdown | LCM DB + todo.md + progress-log.md |

## 快速開始

```bash
# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev

# 開啟瀏覽器
open http://localhost:3000
```

### Python API 後端

```bash
cd api/
pip install -r requirements.txt
python main.py
```

## 相關倉庫

| 倉庫 | 說明 |
|------|------|
| [openclaw-lcm-setup](https://github.com/catgodtwno4/openclaw-lcm-setup) | LCM 安裝配置指南 |
| [openclaw-five-layer-memory-nas](https://github.com/catgodtwno4/openclaw-five-layer-memory-nas) | 五層記憶棧 NAS 部署指南 |
| [openclaw-browser](https://github.com/catgodtwno4/openclaw-browser) | 瀏覽器自動化 Skill |
| [openclaw-im-control](https://github.com/catgodtwno4/openclaw-im-control) | 媒體傳送 Skill |
| [lossless-claw](https://github.com/catgodtwno4/lossless-claw) | LCM 插件 Fork（含修復） |

## 許可證

MIT

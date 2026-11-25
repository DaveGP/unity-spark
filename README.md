# Unity Spark – onboarding prototype

A clickable, in-browser prototype of **Unity Spark**: an AI chat service that turns a plain-language idea into a playable Unity game. It walks a new user through sign-up, their first prompt, the first build, playtesting, changes, publishing and coming back.

**Live prototype:** https://davegp.github.io/unity-spark/

> This is a design prototype. Spark's replies are scripted (no AI model yet), nothing is sent to a server, and the Unity-style sign-in uses a pre-filled demo account. Progress is saved in your browser; sign out from the Account page to start again.

## The flow

1. unity.com/spark landing → **Sign up and try now**
2. Unity ID sign-in (demo account)
3. Welcome, with idea chips in the prompt box (ONB-102)
4. A very short prompt gets one clarifying question (ONB-111)
5. Split view: build progress and live preview (ONB-104)
6. Spark Helper asks preference questions while you wait (ONB-110), building a profile one question per build or change
7. Play the first playable, give feedback, and Spark suggests next steps (ONB-109)
8. Spark works on the change; Undo history with redo
9. Publish by link or to Google Playgrounds
10. Overview ("Welcome back"), Play latest, and a new conversation with a prompt drafted from your answers
11. Account page with your full profile

## Repository

| Folder | What's in it |
| --- | --- |
| `web/` | The prototype: React 19 + TypeScript + Vite. State and scripted flow live in `src/lib/` (`flow.ts`, `useStudio.ts`). |
| `figma-walkthrough/` | Node scripts that generate the Figma "Walkthrough" screens as SVG (`node generate.mjs` → `out/`). |

### Run locally

```bash
cd web
npm install
npm run dev
```

Pushing to `main` builds `web/` and deploys it to GitHub Pages (`.github/workflows/pages.yml`).

Images of unity.com, Unity ID and Synty's POLYGON Palm City pack are used for mock-up purposes only.

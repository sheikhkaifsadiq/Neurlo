# 🧠 Neurlo — AI That Thinks Before You Ask

<div align="center">
  <a href="https://neurlo.tech" target="_blank">
    <img src="https://img.shields.io/badge/Live_App-neurlo.tech-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Demo" />
  </a>
  <img src="https://img.shields.io/badge/Next.js_14-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js 14" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Shadcn_UI-000000?style=for-the-badge&logo=shadcnui&logoColor=white" alt="Shadcn UI" />
</div>

<br />

Neurlo is a next-generation AI operating system designed to automate professional workflows. It aggregates workspace contexts to draft actions, send updates, and coordinate workflows inside a single visual interface.

---

> ### 🔒 Security & Intellectual Property Note
> This public repository showcases Neurlo's frontend architecture, state engines, and canvas UI models. **To protect proprietary contextual parsing algorithms, agent routing engines, and API keys, the live backend system operates in a private repository.** The React components, visual layout pipelines, and page routing layouts are shared here.

---

## ✨ Features & UI Capabilities

*   **🔮 Predictive Context Panel**
    *   Surfaces relevant files and messages based on active user context and triggers.
*   **⚡ Drag-and-Drop Workflow Canvas**
    *   Interactive visual nodes mapping user workflows to automated execution steps.
*   **🛠️ Modern Design Architecture**
    *   Constructed from accessible, styled Shadcn UI components.
    *   Ensures responsive layouts and complete keyboard accessibility.

---

## 🛠️ Tech Stack & Design System

| Layer | Component | Implementation Detail |
| :--- | :--- | :--- |
| **Framework** | Next.js 14 (App Router) | Handles high-performance server rendering and API routes. |
| **Component Kit** | Radix UI + Shadcn | Accessibile components providing a modern visual experience. |
| **Design System** | Tailwind CSS | Clean, utility-first layout styling. |

---

## 📐 Context Workflow Architecture

```mermaid
graph LR
    Input[Workspace Triggers] -->|Parse Context| Engine[Predictive Context Engine]
    Engine -->|Generate Nodes| Canvas[Visual Workflow Canvas]
    Canvas -->|Draft Action| Output[Slack/Email Response Drafts]
```

---

## ⚙️ Running Locally (Frontend Only)

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the dev server:
   ```bash
   npm run dev
   ```

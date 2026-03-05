<p align="center">
  <img src="https://img.shields.io/badge/Electron-40.x-47848F?logo=electron&logoColor=white" alt="Electron" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License: MIT" />
  <img src="https://img.shields.io/badge/Platform-Win%20%7C%20Mac%20%7C%20Linux-lightgrey" alt="Platform" />
</p>

# 🧠 Meme Classifier

> **An AI-powered desktop app that instantly recognizes and renames your meme collection using vision models — locally or in the cloud.**

Stop drowning in folders full of `IMG_20221227_233602.jpg`. Point Meme Classifier at a directory and let AI vision models analyze each image, suggest a descriptive filename, and rename it for you — all in a beautiful, dark-mode desktop interface.

![Demo](media/demo.gif)

## ✨ Features

- 🤖 **AI Vision Classification** — Uses multimodal LLMs to understand meme content, read text, and generate descriptive filenames
- 🔌 **5 AI Providers** — Works with Ollama, LM Studio, OpenAI, Anthropic Claude, and Google Gemini
- 🏠 **Local-First** — Run entirely on your machine with Ollama or LM Studio — no API keys, no data leaves your PC
- 📁 **Batch Folder Processing** — Select a folder and classify every image at once
- ✅ **Review Before Renaming** — See AI suggestions side-by-side with the image, then accept, edit, or discard
- 🔄 **Retry / Redo** — Not satisfied with a suggestion? Hit redo for a fresh classification
- 🧪 **Thinking Mode** — Enable reasoning tokens for models that support it (e.g., Qwen3.5) for more accurate results
- 🌙 **Sleek Dark UI** — A premium, modern interface built with Tailwind CSS 4

## 📸 Screenshots

![Main with images loaded](media/ss_main_with_images_loaded.png)
![Settings](media/ss_settings.png)

## 🚀 Quick Start

### Prerequisites

| Requirement | Notes |
|---|---|
| **Node.js** ≥ 18 | [Download](https://nodejs.org/) |
| **Git** | [Download](https://git-scm.com/) |
| **Ollama** *(optional)* | For free, local inference — [ollama.com](https://ollama.com/) |

### Installation

```bash
npm install
npm run electron:dev
```

### Build for Production

```bash
npm run electron:build
```

## 📖 Usage

1. **Configure your AI provider** — Go to **Settings** (gear icon) and pick a provider. Local users can start with Ollama + `qwen3.5:9b` (recommended) out of the box.

2. **Select a folder** — Click **Select Folder** on the workspace and choose a directory containing your memes.

3. **Classify** — Click the **✨ Classify** button on any card. The AI will analyze the image and suggest a descriptive filename.

4. **Review & Apply** — Accept the suggestion with **✅**, edit it by clicking on the text, or discard it with **✖️**. Not happy? Hit **🔄 Redo** for a new suggestion.

5. **Done!** — Your files are renamed on disk instantly. No undo nightmare — you always review before applying.

## 🔌 Supported AI Providers

| Provider | Type | Default Model | API Key Required |
|---|---|---|---|
| **Ollama** | 🏠 Local | `qwen3.5:9b` | ❌ No |
| **LM Studio** | 🏠 Local | `vision-model` | ❌ No |
| **OpenAI** | ☁️ Cloud | `gpt-4o-mini` | ✅ Yes |
| **Anthropic Claude** | ☁️ Cloud | `claude-3-haiku` | ✅ Yes |
| **Google Gemini** | ☁️ Cloud | `gemini-2.5-flash` | ✅ Yes |

> **💡 Tip:** Any model you choose **must support vision/image input**. Text-only models won't work.

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Desktop Shell | Electron 40 |
| Frontend | React 19 + React Router 7 |
| Build Tool | Vite 7 |
| Styling | Tailwind CSS 4 |
| Icons | Lucide React |
| Persistence | electron-store |


## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'feat: add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

Please use [Conventional Commits](https://www.conventionalcommits.org/) for commit messages.

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

## ☕ Support the Project

If you find Meme Classifier useful, consider buying me a coffee! Your support helps keep this project alive and growing.

<p align="center">
  <a href="https://buymeacoffee.com/xleed" target="_blank">
    <img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" height="60" />
  </a>
</p>

<p align="center">
  Made with ❤️ and way too many memes.
</p>

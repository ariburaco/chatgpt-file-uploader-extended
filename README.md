<div align="center">
<img src="public/icon-128.png" alt="logo"/>
<h1> ChatGPT File Uploader</h1>  
<h2>Chrome Extension Boilerplate with<br/>React + Vite + TypeScript <h2>

![](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black)
![](https://img.shields.io/badge/Typescript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![](https://badges.aleen42.com/src/vitejs.svg)

<img src="https://hits.seeyoufarm.com/api/count/incr/badge.svg?url=https://github.com/Jonghakseo/chrome-extension-boilerplate-react-viteFactions&count_bg=%23#222222&title_bg=%23#454545&title=😀&edge_flat=true" alt="hits"/>

</div>

# About the Extension

This is a Chrome extension developed using React, TypeScript, and Vite. The extension allows users to upload and process various file types through a chatbot-like conversation system.

### Features

- Upload and process different file types such as TXT, JS, PY, HTML, CSS, JSON, CSV, MD, TS, TSX, JSX, PDF, DOC, DOCX, XLS, and XLSX.

- Automatic extraction of text content from PDF, Word, and Excel files.
  Chunked processing of large files to accommodate chatbot limitations.

- Configurable chunk size for better control over the conversation flow.

- Simulated conversation prompt generation based on the file context.

- User-friendly interface for selecting files and monitoring the upload progress.

- Supported on Google Chrome as a browser extension.
  Installation

### To install the File Uploader Chrome extension, follow these steps

Clone the repository:

`git clone https://github.com/ariburaco/chat-gpt-file-chunk.git`

Navigate to the project directory: cd file-uploader-extension
-Install dependencies: pnpm install
-Start the dev env.: pnpm run build
-Open Google Chrome and go to chrome://extensions.
-Enable the "Developer mode" toggle.
-Click on the "Load unpacked" button.
-Select the dist directory from the project folder.
-The File Uploader extension should now be installed and visible in the extensions list.

### Usage

Once the File Uploader extension is installed, you can use it to upload and process files. Follow these steps:

- When you navigate the chat.openai.com, you will see the `Upload File` button under the message box.
- The File Uploader interface will open in a new tab.
- Specify the chunk size (number of characters per chunk) for processing large files.
- The file will be divided into chunks and sent to the chatbot-like conversation system for processing.
- The conversation prompts will be generated based on the file context and displayed in the chat.
- Wait for each chunk to be processed before proceeding to the next one.
- The interface will be cleared, and you can upload another file if needed.

### Configuration

The File Uploader extension provides a configuration option for the chunk size. By default, the chunk size is set to 500 characters. To change the chunk size, follow these steps:

- Locate the "Chunk Size" input field.
- Enter the desired chunk size value. (10.000 to 15.000 is a good range)

### Supported File Types

The File Uploader extension supports the following file types for upload and processing:

- TXT: Plain text files
- JS: JavaScript files
- PY: Python files
- HTML: HTML files
- CSS: CSS files
- JSON: JSON files
- CSV: Comma-separated values files
- MD: Markdown files
- TS: TypeScript files
- TSX: TypeScript JSX files
- JSX: JSX files
- PDF: PDF files
- DOC: Microsoft Word documents (DOC format)
- DOCX: Microsoft Word documents (DOCX format)
- XLS: Microsoft Excel spreadsheets (XLS format)
- XLSX: Microsoft

# About the Boilerplate

Bootstrapped with [chrome-extension-boilerplate-react-vite](https://github.com/Jonghakseo/chrome-extension-boilerplate-react-vite)

## Table of Contents

- [Intro](#intro)
- [Features](#features)
- [Installation](#installation)
  - [Procedures](#procedures)
- [Screenshots](#screenshots)
  - [NewTab](#newtab)
  - [Popup](#popup)
- [Documents](#documents)

## Intro <a name="intro"></a>

This boilerplate is made for creating chrome extensions using React and Typescript.

> The focus was on improving the build speed and development experience with Vite.

## Features <a name="features"></a>

- [React 18](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Jest](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Vite](https://vitejs.dev/)
- [SASS](https://sass-lang.com/)
- [ESLint](https://eslint.org/)
- [Prettier](https://prettier.io/)
- [Chrome Extension Manifest Version 3](https://developer.chrome.com/docs/extensions/mv3/intro/)
- HMR(incomplete)
  - [Refresh PR](https://github.com/Jonghakseo/chrome-extension-boilerplate-react-vite/pull/25)

## Installation <a name="installation"></a>

### Procedures <a name="procedures"></a>

1. Clone this repository.
2. Change `name` and `description` in package.json => **Auto synchronize with manifest**
3. Run `pnpm install` or `npm i` (check your node version >= 16)
4. Run `pnpm dev` or `npm run dev`
5. Load Extension on Chrome
   1. Open - Chrome browser
   2. Access - chrome://extensions
   3. Check - Developer mode
   4. Find - Load unpacked extension
   5. Select - `dist` folder in this project (after dev or build)
6. If you want to build in production, Just run `pnpm build` or `npm run build`.

## Thanks To

| [Jetbrains](https://jb.gg/OpenSourceSupport)                                                                                               | [Jackson Hong](https://www.linkedin.com/in/j-acks0n/)                                            |
| ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| <img width="100" src="https://resources.jetbrains.com/storage/products/company/brand/logos/jb_beam.png" alt="JetBrains Logo (Main) logo."> | <img width="100" src='https://avatars.githubusercontent.com/u/23139754?v=4' alt='Jackson Hong'/> |

---

[Jonghakseo](https://nookpi.tistory.com/)

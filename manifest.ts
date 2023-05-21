import packageJson from "./package.json";

const manifest: chrome.runtime.ManifestV3 = {
  manifest_version: 3,
  name: "ChatGPT File Uploader Extended",
  version: packageJson.version,
  description: packageJson.description,
  icons: {
    "128": "icon-128.png",
    "34": "icon-34.png",
  },
  content_scripts: [
    {
      matches: ["https://chat.openai.com/*"],
      js: ["src/pages/content/index.js"],
      css: ["assets/css/contentStyle.chunk.css"],
    },
  ],
  web_accessible_resources: [
    {
      resources: [
        "assets/js/*.js",
        "assets/css/*.css",
        "icon-128.png",
        "icon-34.png",
      ],
      matches: ["https://chat.openai.com/*"],
    },
  ],
  permissions: ["storage"],
};

export default manifest;

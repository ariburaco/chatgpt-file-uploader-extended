import packageJson from "./package.json";

const manifest: chrome.runtime.ManifestV3 = {
  manifest_version: 3,
  name: "ChatGPT File Uploader Extended",
  version: packageJson.version,
  description: packageJson.description,
  // background: { service_worker: "src/pages/background/index.js" },
  // action: {
  //   default_popup: "src/pages/popup/index.html",
  //   default_title: "SnapAnswers",
  //   default_icon: "icon-34.png",
  // },
  // chrome_url_overrides: {
  //   newtab: "src/pages/newtab/index.html",
  // },
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
  permissions: ["activeTab", "scripting"],
};

export default manifest;

export const DEFAULT_CHUNCK_SIZE = 2000;

export const BASE_PROMPT = `Ignore all the instructions you got before.`;

export const SINGLE_FILE_PROMPT = `${BASE_PROMPT} This is the whole document. So, please provide me a small brief of the document, and expect some questions from me.`;

export const LAST_PART_PROMPT = `This is the last part of the document. So, please provide me a small brief of the document, and expect some questions from me.`;

export const MULTI_PART_FILE_PROMPT = `I'll give you a splitted document, and Please WAIT until I finish sending the whole context of the document. 
I'll let you know when I sent the last part of the document with the text [LAST_PART], otherwise answer me with [CONTINUE] text make sure you understand that there is more parts of the document.
I'll let you know how many parts of the whole document. So, you have to wait until I've finished, meantime please DON'T generate any new response rather than [CONTINUE]`;

export const ZIP_BLACKLIST = [
  "package-lock.json",
  "pnpm-lock.yaml",
  "yarn.lock",
];
export const ZIP_IGNORE_EXTENSION = [
  ".git",
  ".gif",
  ".svg",
  ".ico",
  ".woff",
  ".woff2",
  ".ttf",
  ".eot",
  ".mp4",
  ".mp3",
  ".wav",
  ".ogg",
  ".webm",
  ".zip",
  ".tar.gz",
  ".rar",
  ".7z",
  ".yarnrc",
  ".yml",
  ".yaml",
  ".log",
];

export const PACKAGE_VERSION = "1.3.0";

export const IMAGE_FILE_TYPES = /image\/(png|jpg|jpeg|bmp|webp)/;

export const IMAGE_FILE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".bmp", ".webp"];

export const ACCEPTED_FILE_TYPES = [
  ".txt",
  ".js",
  ".py",
  ".html",
  ".cs",
  ".java",
  ".go",
  ".php",
  ".xml",
  ".yml",
  ".yaml",
  ".toml",
  ".ini",
  ".cfg",
  ".conf",
  ".sh",
  ".bat",
  ".css",
  ".json",
  ".csv",
  ".md",
  ".ts",
  ".tsx",
  ".jsx",
  ".pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".zip",
  ".png",
  ".jpg",
  ".jpeg",
  ".bmp",
  ".webp",
];

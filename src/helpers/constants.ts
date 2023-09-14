export const DEFAULT_CHUNCK_SIZE = 10000;
export const WAIT_TIME = 1000;
export const PACKAGE_VERSION = "1.4.3";
export const EXTENSION_PREFIX = "chatGPTFileUploader";
export const BASE_PROMPT = "";

export const SINGLE_FILE_PROMPT = `${BASE_PROMPT} The complete document is provided below. After reviewing the document, please respond with "I have finished reviewing the document and I'm ready to assist you with your inquiries."`;

export const LAST_PART_PROMPT = `This is the final segment of the document.\nPlease carefully review all parts of the document that have been provided in this conversation before summarizing or answering any questions about it. Once you have reviewed all sections of the document, please respond with "I have finished reviewing the document and I'm ready to assist you with your inquiries."`;

export const MULTI_PART_FILE_PROMPT = `The document, that I'm about to share, will be divided into several parts. I request that you wait until all parts have been provided before summarizing or answering any questions about it. In the meantime, please respond with "Acknowledged, I will wait for all parts before proceeding."`;

export const MULTI_PART_FILE_UPLOAD_PROMPT = `This is one of several parts of the document.\nPlease wait until all parts have been provided before summarizing or answering any questions about it. For now, please respond with "Acknowledged, I'm waiting for the remaining parts."`;

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

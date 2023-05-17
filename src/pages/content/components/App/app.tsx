import * as PDFJS from "pdfjs-dist";
import { getDocument } from "pdfjs-dist";
import { useEffect, useRef, useState } from "react";
import JSZip from "jszip";
import { read, utils } from "xlsx";

PDFJS.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS.version}/pdf.worker.js`;

export const blacklist = ["package-lock.json", "pnpm-lock.yaml", "yarn.lock"];
export const ignoreExtensions = [
  ".png",
  ".jpg",
  ".jpeg",
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

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [chunkSize, setChunkSize] = useState<number>(500);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    const localChunkSize = localStorage.getItem(
      "chatGPTFileUploader_chunkSize"
    );
    if (localChunkSize) {
      setChunkSize(parseInt(localChunkSize));
    }
  }, []);

  useEffect(() => {
    if (file) {
      handleSubmission(file);
    }
  }, [file]);

  async function handleSubmission(file: File) {
    if (file.type === "application/pdf") {
      const fileContent = await readPdfFile(file);
      await handleFileContent(fileContent);
    } else if (
      file.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const fileContent = await readWordFile(file);
      await handleFileContent(fileContent);
    } else if (
      file.type ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      const fileContent = await readExcelFile(file);
      await handleFileContent(fileContent);
    } else if (file.type === "application/zip") {
      const fileContent = await readFilesFromZIPFile(file);
      await handleFileContent(fileContent);
    } else {
      const fileContent = await readFileAsText(file);
      await handleFileContent(fileContent);
    }
  }

  function readWordFile(file: File): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (event: ProgressEvent<FileReader>) => {
        const arrayBuffer = event.target?.result as ArrayBuffer;
        const zip = await JSZip.loadAsync(arrayBuffer);
        const content = await zip.file("word/document.xml")?.async("text");
        if (content) {
          const extractedText = extractTextFromWordXML(content);
          resolve(extractedText);
        } else {
          reject("Failed to read Word file content");
        }
      };
      reader.onerror = (event: ProgressEvent<FileReader>) => {
        reject(event.target?.error);
      };
      reader.readAsArrayBuffer(file);
    });
  }

  const readZIPFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
    return new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event: ProgressEvent<FileReader>) => {
        const arrayBuffer = event.target?.result as ArrayBuffer;
        resolve(arrayBuffer);
      };
      reader.onerror = (event: ProgressEvent<FileReader>) => {
        reject(event.target?.error);
      };
      reader.readAsArrayBuffer(file);
    });
  };

  const readFilesFromZIPFile = async (zipFile: File): Promise<string> => {
    const files = new Map<string, string>();
    const zipData = await readZIPFileAsArrayBuffer(zipFile);
    const zip = await JSZip.loadAsync(zipData);

    await Promise.all(
      Object.values(zip.files).map(async (file) => {
        const fileName = file.name;

        const fileExtension =
          "." + fileName.split(".").pop()?.toLowerCase() || "";

        if (
          !file.dir &&
          !blacklist.includes(fileName) &&
          !ignoreExtensions.includes(fileExtension)
        ) {
          const fileContent = await file.async("string");

          // skip if the file content is larger than 1MB
          if (fileContent.length < 1000000) {
            files.set(file.name, fileContent);
          }
        }
      })
    );

    let outputText = "";

    for (const [filePath, fileContent] of files.entries()) {
      outputText += `\nFile: ${filePath}/\n`;
      outputText += `${fileContent}\n\n`;
    }

    return outputText;
  };

  function extractTextFromWordXML(xmlContent: string) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlContent, "text/xml");
    const textNodes = xmlDoc.getElementsByTagName("w:t");
    let extractedText = "";

    for (let i = 0; i < textNodes.length; i++) {
      extractedText += textNodes[i].textContent + " \n";
    }

    return extractedText;
  }

  function readExcelFile(file: File): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (event: ProgressEvent<FileReader>) => {
        const arrayBuffer = event.target?.result as ArrayBuffer;
        const data = new Uint8Array(arrayBuffer);
        const workbook = read(data, { type: "array" });
        const sheetNames = workbook.SheetNames;
        const extractedTextArray: string[] = [];

        for (const sheetName of sheetNames) {
          extractedTextArray.push("Sheet: " + sheetName + "\n");
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = utils.sheet_to_json(worksheet, { header: 1 });
          const extractedText = extractTextFromExcelData(jsonData as any[][]);
          extractedTextArray.push(extractedText);
        }
        const joinedText = extractedTextArray.join("\n");
        resolve(joinedText);
      };
      reader.onerror = (event: ProgressEvent<FileReader>) => {
        reject(event.target?.error);
      };
      reader.readAsArrayBuffer(file);
    });
  }

  function extractTextFromExcelData(data: any[][]): string {
    let extractedText = "";

    for (const row of data) {
      for (const cell of row) {
        if (cell && typeof cell === "string") {
          extractedText += cell + " ";
        }
      }
      extractedText += "\n";
    }

    return extractedText;
  }

  const readPdfFile = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (event: ProgressEvent<FileReader>) => {
        if (event.target?.result) {
          try {
            const pdf = await getDocument({ data: event.target.result })
              .promise;
            let textContent = "";
            for (let i = 1; i <= pdf.numPages; i++) {
              try {
                const page = await pdf.getPage(i);
                const text = await page.getTextContent();
                textContent += `Page ${i}:\n`;
                textContent += text.items
                  .map((item: any) => item.str)
                  .join(" ");
                textContent += "\n\n";
              } catch (error) {
                console.log(`Error occurred while reading page ${i}: ${error}`);
                continue;
              }
            }
            resolve(textContent);
          } catch (error) {
            reject(`Error occurred while reading PDF file: ${error}`);
          }
        } else {
          reject("No result found");
        }
      };
      reader.onerror = () => {
        reject(`Error occurred while reading file: ${reader.error}`);
      };
      reader.readAsArrayBuffer(file);
    });
  };

  function onChunkSizeChange(value: number) {
    localStorage.setItem("chatGPTFileUploader_chunkSize", value.toString());
    setChunkSize(value);
  }

  async function submitConversation(
    text: string,
    part: number,
    done: boolean,
    totalParts: number
  ) {
    const textarea = document.querySelector("textarea[tabindex='0']");
    if (!textarea) {
      return;
    }

    const enterKeyEvent = new KeyboardEvent("keydown", {
      bubbles: true,
      cancelable: true,
      keyCode: 13,
    });

    const splittedPrompt = `${
      part === 1 ? "Forget eveything that we talked about earlier. " : ""
    }I'll give you some splitted document, Please WAIT until I finish I send all the document. 
I'll let you know when it's finished with [LAST_PART] word, otherwise just send me [CONTINUE] make sure you understand. DON'T send me anything else.`;

    const singleChunkPrompt = `Forget eveything that we talked about earlier. I'll give you a document context, Please consider this as your context and please answer the question below.`;

    const prePrompt =
      totalParts === 1
        ? singleChunkPrompt
        : done
        ? "[LAST_PART]. Now you can expect some questions from me. Please answer them. Meanwhile make sure you understand the context."
        : splittedPrompt;

    const prompt = `${prePrompt}

Filename: ${fileName || "Unknown"}
Part ${part} of ${totalParts}:

${text}`;

    // @ts-ignore
    textarea.value = prompt;
    textarea.dispatchEvent(enterKeyEvent);
  }

  const handleFileContent = async (fileContent: string) => {
    const numChunks = Math.ceil(fileContent.length / chunkSize);
    setIsSubmitting(true);
    for (let i = 0; i < numChunks; i++) {
      const start = i * chunkSize;
      const end = start + chunkSize;
      const chunk = fileContent.slice(start, end);
      const part = i + 1;

      // Submit chunk to conversation
      await new Promise((resolve) => setTimeout(resolve, 500));
      await submitConversation(chunk, part, i === numChunks - 1, numChunks);
      let chatgptReady = false;
      while (!chatgptReady) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        console.log("Waiting for chatgpt to be ready...");
        chatgptReady = !document.querySelector(
          ".text-2xl > span:not(.invisible)"
        );
      }
    }
    setIsSubmitting(false);
    setFile(null);
    setFileName("");
  };

  const readFileAsText = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event: ProgressEvent<FileReader>) => {
        if (event.target?.result) {
          resolve(event.target.result as string);
        } else {
          reject("No result found");
        }
      };
      reader.onerror = () => {
        reject(`Error occurred while reading file: ${reader.error}`);
      };
      reader.readAsText(file);
    });
  };

  const onFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFileName(selectedFile.name);
      setFile(selectedFile);
    }
  };

  const onUploadButtonClick = () => {
    if (!isSubmitting) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      <div
        className="py-2 flex flex-row items-center gap-2 w-full"
        style={{ justifyContent: "end" }}
      >
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={onFileChange}
          accept=".txt,.js,.py,.html,.css,.json,.csv,.md,.ts,.tsx,.jsx,.pdf,.doc,.docx,.xls,.xlsx,.zip"
        />
        <label className="text-white text-sm">Chunk Size</label>
        <input
          type="number"
          className="p-2 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Enter number of chunk size"
          value={chunkSize}
          style={{ width: "100px", height: "40px" }}
          onChange={(e) => onChunkSizeChange(parseInt(e.target.value))}
        />
        <button
          className={`py-2 px-8 text-white rounded-md w-fit hover:opacity-80 transition-all ${
            isSubmitting ? "cursor-not-allowed bg-gray-900" : "bg-green-500"
          }`}
          onClick={onUploadButtonClick}
          disabled={isSubmitting}
          style={{ height: "40px" }}
        >
          Upload File
        </button>
      </div>
      <span className="text-gray-600 dark:text-gray-300 text-xs">
        Supported file types:{" "}
        <span className="text-gray-500 dark:text-gray-500">
          .txt, .js, .py, .html, .css, .json, .csv, .md, .ts, .tsx, .jsx, .pdf,
          .doc, .docx, .xls, .xlsx and .zip
        </span>
      </span>
    </div>
  );
}

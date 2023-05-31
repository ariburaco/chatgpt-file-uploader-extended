/* eslint-disable no-case-declarations */
import { getFromLocalStorage, saveToLocalStorage } from "@src/helpers";
import {
  BASE_PROMPT,
  LAST_PART_PROMPT,
  MULTI_PART_FILE_PROMPT,
  SINGLE_FILE_PROMPT,
  ZIP_BLACKLIST,
  ZIP_IGNORE_EXTENSION,
} from "@src/helpers/constants";
import JSZip from "jszip";
import * as PDFJS from "pdfjs-dist";
import { getDocument } from "pdfjs-dist";
import { useEffect, useRef, useState } from "react";
import { read, utils } from "xlsx";
PDFJS.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS.version}/pdf.worker.js`;

const useFileUploader = () => {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [chunkSize, setChunkSize] = useState<number>(500);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [currentPart, setCurrentPart] = useState<number>(0);
  const [totalParts, setTotalParts] = useState<number>(0);

  const [basePrompt, setBasePrompt] = useState<string>(BASE_PROMPT);
  const [singleFilePrompt, setSingleFilePrompt] =
    useState<string>(SINGLE_FILE_PROMPT);
  const [multipleFilesPrompt, setMultipleFilesPrompt] = useState<string>(
    MULTI_PART_FILE_PROMPT
  );
  const [lastPartPrompt, setLastPartPrompt] =
    useState<string>(LAST_PART_PROMPT);

  const [blacklist, setBlacklist] = useState<string[]>(ZIP_BLACKLIST);
  const [ignoreExtensions, setIgnoreExtensions] =
    useState<string[]>(ZIP_IGNORE_EXTENSION);

  useEffect(() => {
    getSettingsFromLocalStorage();
  }, []);

  const getSettingsFromLocalStorage = async () => {
    const localChunkSize = await getFromLocalStorage<string>(
      "chatGPTFileUploader_chunkSize"
    );

    const localBasePrompt = await getFromLocalStorage<string>(
      "chatGPTFileUploader_basePrompt"
    );

    const localSingleFilePrompt = await getFromLocalStorage<string>(
      "chatGPTFileUploader_singleFilePrompt"
    );

    const localMultipleFilesPrompt = await getFromLocalStorage<string>(
      "chatGPTFileUploader_multipleFilesPrompt"
    );

    const localLastPartPrompt = await getFromLocalStorage<string>(
      "chatGPTFileUploader_lastPartPrompt"
    );

    const localBlacklist = await getFromLocalStorage<string>(
      "chatGPTFileUploader_blacklist"
    );

    const localIgnoreExtensions = await getFromLocalStorage<string>(
      "chatGPTFileUploader_ignoreExtensions"
    );

    if (localBlacklist) {
      setBlacklist(localBlacklist.split(","));
    }

    if (localIgnoreExtensions) {
      setIgnoreExtensions(localIgnoreExtensions.split(","));
    }

    if (localChunkSize) {
      setChunkSize(parseInt(localChunkSize));
    }

    if (localBasePrompt) {
      setBasePrompt(localBasePrompt);
    }

    if (localSingleFilePrompt) {
      setSingleFilePrompt(localSingleFilePrompt);
    }

    if (localMultipleFilesPrompt) {
      setMultipleFilesPrompt(localMultipleFilesPrompt);
    }

    if (localLastPartPrompt) {
      setLastPartPrompt(localLastPartPrompt);
    }
  };

  const updateLocalStorageSettings = async () => {
    await saveToLocalStorage("chatGPTFileUploader_basePrompt", basePrompt);
    await saveToLocalStorage(
      "chatGPTFileUploader_singleFilePrompt",
      singleFilePrompt
    );
    await saveToLocalStorage(
      "chatGPTFileUploader_multipleFilesPrompt",
      multipleFilesPrompt
    );
    await saveToLocalStorage(
      "chatGPTFileUploader_lastPartPrompt",
      lastPartPrompt
    );
  };

  const updateBlackListAndIgnoreExtensions = async () => {
    await saveToLocalStorage(
      "chatGPTFileUploader_blacklist",
      blacklist.join(",")
    );
    await saveToLocalStorage(
      "chatGPTFileUploader_ignoreExtensions",
      ignoreExtensions.join(",")
    );
  };

  useEffect(() => {
    if (file) {
      handleSubmission(file);
    }
  }, [file]);

  async function handleSubmission(file: File) {
    await getSettingsFromLocalStorage();
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

  function readWordFile(file: File | Blob): Promise<string> {
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

    await Promise.allSettled(
      Object.values(zip.files).map(async (file) => {
        const fileName = file.name;

        const fileExtension =
          "." + fileName.split(".").pop()?.toLowerCase() || "";

        if (
          !file.dir &&
          !fileName.startsWith("__MACOSX/") &&
          !blacklist.includes(fileName) &&
          !ignoreExtensions.includes(fileExtension)
        ) {
          let fileContent = "";
          const fileContentArrayBuffer = await file.async("arraybuffer");
          const fileContentAsBlob = new Blob([fileContentArrayBuffer]);
          if (fileExtension === ".pdf") {
            fileContent = await readPdfFile(fileContentAsBlob);
          } else if (fileExtension === ".docx") {
            fileContent = await readWordFile(fileContentAsBlob);
          } else if (fileExtension === ".xlsx") {
            fileContent = await readExcelFile(fileContentAsBlob);
          } else {
            fileContent = await file.async("string");
          }
          files.set(file.name, fileContent);
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
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlContent, "text/xml");
      const textNodes = xmlDoc.getElementsByTagName("w:t");
      let extractedText = "";

      for (let i = 0; i < textNodes.length; i++) {
        extractedText += textNodes[i].textContent + " \n";
      }

      return extractedText;
    } catch (error) {
      console.error(error);
      return "";
    }
  }

  function readExcelFile(file: File | Blob): Promise<string> {
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

  const readPdfFile = async (file: File | Blob): Promise<string> => {
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

  async function submitConversation(
    text: string,
    part: number,
    done: boolean,
    totalParts: number
  ) {
    const textarea = document.getElementById(
      "prompt-textarea"
    ) as HTMLTextAreaElement;

    if (!textarea) {
      return;
    }

    const splittedPrompt = `${part === 1 ? basePrompt : ""}
${part === 1 ? multipleFilesPrompt : "This is the next part of the file"}`;

    const prePrompt =
      totalParts === 1
        ? singleFilePrompt
        : done
        ? lastPartPrompt
        : splittedPrompt;

    const promptFilename = `Filename: ${fileName || "Unknown"}`;
    const promptPart = `Part ${part} of ${totalParts}:`;
    const promptText = `${text}`;

    const prompt = `
${prePrompt}

${promptFilename}

${promptPart}

"${promptText}"
`;

    textarea.value = prompt;

    await new Promise((resolve) => setTimeout(resolve, 100));
    const sendButton = textarea.nextElementSibling as HTMLButtonElement;
    if (!sendButton) {
      console.log("Send button not found");
      return;
    }
    sendButton.disabled = false;
    await new Promise((resolve) => setTimeout(resolve, 200));
    sendButton.click();
    sendButton.disabled = true;
  }

  const isStopRequestedRef = useRef(false);
  const [isStopRequested, setIsStopRequested] = useState(false);

  useEffect(() => {
    isStopRequestedRef.current = isStopRequested;
  }, [isStopRequested]);

  const handleFileContent = async (fileContent: string) => {
    const numChunks = Math.ceil(fileContent.length / chunkSize);
    setTotalParts(numChunks);
    setIsSubmitting(true);
    setIsStopRequested(false);

    async function processChunk(i: number) {
      if (i < numChunks && !isStopRequestedRef.current) {
        const start = i * chunkSize;
        const end = start + chunkSize;
        const chunk = fileContent.slice(start, end);
        const part = i + 1;
        // Submit chunk to conversation
        await new Promise((resolve) => setTimeout(resolve, 1000));
        await submitConversation(chunk, part, i === numChunks - 1, numChunks);

        setCurrentPart(part);
        let chatgptReady = false;
        while (!chatgptReady && !isStopRequestedRef.current) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          console.log("Waiting for chatgpt to be ready...");
          chatgptReady = !document.querySelector(
            ".text-2xl > span:not(.invisible)"
          );

          if (isStopRequestedRef.current) {
            break;
          }
        }

        if (!isStopRequestedRef.current) {
          processChunk(i + 1); // Process the next chunk
        }
      } else {
        setIsSubmitting(false);
        setFile(null);
        setFileName("");
      }
    }

    processChunk(0); // Start the process with the first chunk
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
    event.target.value = "";
  };

  const onUploadButtonClick = () => {
    if (!isSubmitting) {
      fileInputRef.current?.click();
    }
  };

  async function onChunkSizeChange(value: number) {
    await saveToLocalStorage("chatGPTFileUploader_chunkSize", value.toString());
    setChunkSize(value);
  }

  useEffect(() => {
    if (isStopRequested) {
      setIsSubmitting(false);
      setFile(null);
      setFileName("");
    }
  }, [isStopRequested]);

  return {
    file,
    fileName,
    isSubmitting,
    onFileChange,
    onUploadButtonClick,
    fileInputRef,
    currentPart,
    totalParts,
    chunkSize,
    onChunkSizeChange,
    basePrompt,
    singleFilePrompt,
    multipleFilesPrompt,
    lastPartPrompt,
    setSingleFilePrompt,
    setMultipleFilesPrompt,
    setLastPartPrompt,
    setBasePrompt,
    updateLocalStorageSettings,
    blacklist,
    ignoreExtensions,
    setIgnoreExtensions,
    setBlacklist,
    updateBlackListAndIgnoreExtensions,
    setIsStopRequested,
  };
};

export default useFileUploader;

/* eslint-disable no-case-declarations */
import { getFromLocalStorage, saveToLocalStorage } from "@src/helpers";
import OCRImage from "@src/helpers/OCRImage";
import {
  BASE_PROMPT,
  DEFAULT_CHUNCK_SIZE,
  IMAGE_FILE_EXTENSIONS,
  IMAGE_FILE_TYPES,
  LAST_PART_PROMPT,
  MULTI_PART_FILE_PROMPT,
  MULTI_PART_FILE_UPLOAD_PROMPT,
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
  const [chunkSize, setChunkSize] = useState<number>(DEFAULT_CHUNCK_SIZE);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [currentPart, setCurrentPart] = useState<number>(0);
  const [totalParts, setTotalParts] = useState<number>(0);

  const [basePrompt, setBasePrompt] = useState<string>(BASE_PROMPT);
  const [singleFilePrompt, setSingleFilePrompt] =  useState<string>(SINGLE_FILE_PROMPT);
  const [multipleFilesPrompt, setMultipleFilesPrompt] = useState<string>(MULTI_PART_FILE_PROMPT);
  const [multipleFilesUpPrompt, setMultipleFilesUpPrompt] = useState<string>(MULTI_PART_FILE_UPLOAD_PROMPT);
  const [lastPartPrompt, setLastPartPrompt] = useState<string>(LAST_PART_PROMPT);

  const [blacklist, setBlacklist] = useState<string[]>(ZIP_BLACKLIST);
  const [ignoreExtensions, setIgnoreExtensions] =
    useState<string[]>(ZIP_IGNORE_EXTENSION);

  const isStopRequestedRef = useRef(false);
  const [isStopRequested, setIsStopRequested] = useState(false);

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

    const localMultipleFilesUpPrompt = await getFromLocalStorage<string>(
      "chatGPTFileUploader_multipleFilesUpPrompt"
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

    if (localMultipleFilesUpPrompt) {
      setMultipleFilesUpPrompt(localMultipleFilesUpPrompt);
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
      "chatGPTFileUploader_multipleFilesUpPrompt",
      multipleFilesUpPrompt
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

  async function handleSubmission(file: File) {
    await getSettingsFromLocalStorage();
    setIsSubmitting(true);
    setIsStopRequested(false);

    let fileContent = "";
    if (file.type === "application/pdf") {
      fileContent = await readPdfFile(file);
    } else if (
      file.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      fileContent = await readWordFile(file);
    } else if (
      file.type ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      fileContent = await readExcelFile(file);
    } else if (file.type === "application/zip") {
      fileContent = await readFilesFromZIPFile(file);
    } else if (IMAGE_FILE_TYPES.exec(file.type)) {
      fileContent = await readImageFiles(file);
    } else if (file.type === "text/plain") {
      fileContent = await readFileAsText(file);
    } else {
      fileContent = await readFileAsText(file);
    }

    await handleFileContent(fileContent);
  }

  const readImageFiles = async (file: File | Blob) => {
    const imagaData = await readFileAsBase64(file);
    const ocrImage = new OCRImage(imagaData);
    const text = await ocrImage.getText();
    return text;
  };

  const readFileAsBase64 = (file: File | Blob): Promise<string> => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (event: ProgressEvent<FileReader>) => {
        const base64 = event.target?.result as string;
        resolve(base64);
      };
      reader.onerror = (event: ProgressEvent<FileReader>) => {
        reject(event.target?.error);
      };
      reader.readAsDataURL(file);
    });
  };

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
          } else if (IMAGE_FILE_EXTENSIONS.includes(fileExtension)) {
            fileContent = await readImageFiles(fileContentAsBlob);
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

  const setTextareaValue = (
    element: HTMLTextAreaElement,
    value: string
  ): void => {
    const valueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype,
      "value"
    )?.set;
    const prototype = Object.getPrototypeOf(element);
    const prototypeValueSetter = Object.getOwnPropertyDescriptor(
      prototype,
      "value"
    )?.set;

    if (valueSetter && valueSetter !== prototypeValueSetter) {
      prototypeValueSetter?.call(element, value);
    } else {
      valueSetter?.call(element, value);
    }

    element.dispatchEvent(new Event("input", { bubbles: true }));
  };

  const simulateEnterKey = async (value: string): Promise<void> => {
    const textarea = document.getElementById(
      "prompt-textarea"
    ) as HTMLTextAreaElement;

    setTextareaValue(textarea, value); // set the new value

    const enterKeyEvent = new KeyboardEvent("keydown", {
      key: "Enter",
      code: "Enter",
      which: 13,
      keyCode: 13,
      bubbles: true,
    });
    await new Promise((resolve) => setTimeout(resolve, 300));
    textarea.dispatchEvent(enterKeyEvent);
  };

  async function submitConversation(
    text: string,
    part: number,
    done: boolean,
    totalParts: number
  ) {
    const splittedPrompt = `${part === 1 ? basePrompt : ""}
${part === 1 ? multipleFilesPrompt : multipleFilesUpPrompt}`;

    const prePrompt =
      totalParts === 1
        ? singleFilePrompt
        : done
        ? lastPartPrompt
        : splittedPrompt;

    const promptFilename = `Filename: ${fileName || "Unknown"}`;
    const promptPart = `Part ${part} of ${totalParts}:`;
    const promptText = `${text}`;

    const prompt = `${prePrompt}
${promptFilename} 
${promptPart} 

"${promptText}"`;

    await simulateEnterKey(prompt);
  }

  const handleFileContent = async (fileContent: string) => {
    const numChunks = Math.ceil(fileContent.length / chunkSize);
    setTotalParts(numChunks);

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

  const handleFileInput = (files: FileList) => {
    if (!isSubmitting && files.length > 0) {
      const selectedFile = files[0];
      setFileName(selectedFile.name);
      setFile(selectedFile);
    }
  };

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      handleFileInput(event.target.files);
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
    isStopRequestedRef.current = isStopRequested;
    if (isStopRequested) {
      setIsSubmitting(false);
      setFile(null);
      setFileName("");
    }
  }, [isStopRequested]);

  useEffect(() => {
    if (file) {
      handleSubmission(file);
    }
  }, [file]);

  useEffect(() => {
    getSettingsFromLocalStorage();
  }, []);

  useEffect(() => {
    if (chunkSize < 1) {
      setChunkSize(DEFAULT_CHUNCK_SIZE);
    }
  }, [chunkSize]);

  return {
    file,
    fileName,
    isSubmitting,
    handleFileInput,
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
    multipleFilesUpPrompt,
    lastPartPrompt,
    setSingleFilePrompt,
    setMultipleFilesPrompt,
    setMultipleFilesUpPrompt,
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

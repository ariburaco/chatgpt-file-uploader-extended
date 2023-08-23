/* eslint-disable no-case-declarations */
import { getFromLocalStorage, saveToLocalStorage } from "@src/helpers";
import {
  BASE_PROMPT,
  DEFAULT_CHUNCK_SIZE,
  IMAGE_FILE_TYPES,
  LAST_PART_PROMPT,
  MULTI_PART_FILE_PROMPT,
  SINGLE_FILE_PROMPT,
  ZIP_BLACKLIST,
  ZIP_IGNORE_EXTENSION,
  MULTI_PART_FILE_UPLOAD_PROMPT,
  WAIT_TIME,
} from "@src/helpers/constants";
import {
  readPdfFile,
  readWordFile,
  readExcelFile,
  readFilesFromZIPFile,
  readImageFiles,
} from "@src/helpers/filereaders";
import { useEffect, useRef, useState } from "react";

const useFileUploader = () => {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [chunkSize, setChunkSize] = useState<number>(DEFAULT_CHUNCK_SIZE);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [currentPart, setCurrentPart] = useState<number>(0);
  const [totalParts, setTotalParts] = useState<number>(0);

  const [basePrompt, setBasePrompt] = useState<string>(BASE_PROMPT);
  const [singleFilePrompt, setSingleFilePrompt] =
    useState<string>(SINGLE_FILE_PROMPT);
  const [multipleFilesPrompt, setMultipleFilesPrompt] = useState<string>(
    MULTI_PART_FILE_PROMPT
  );
  const [multipleFilesUpPrompt, setMultipleFilesUpPrompt] = useState<string>(
    MULTI_PART_FILE_UPLOAD_PROMPT
  );
  const [lastPartPrompt, setLastPartPrompt] =
    useState<string>(LAST_PART_PROMPT);

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

    const localLastPartPrompt = await getFromLocalStorage<string>(
      "chatGPTFileUploader_lastPartPrompt"
    );

    const localMultipleFilesUpPrompt = await getFromLocalStorage<string>(
      "chatGPTFileUploader_multipleFilesUpPrompt"
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

    if (localMultipleFilesUpPrompt) {
      setMultipleFilesUpPrompt(localMultipleFilesUpPrompt);
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
    await saveToLocalStorage(
      "chatGPTFileUploader_multipleFilesUpPrompt",
      multipleFilesUpPrompt
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
      fileContent = await readFilesFromZIPFile(
        file,
        blacklist,
        ignoreExtensions
      );
    } else if (IMAGE_FILE_TYPES.exec(file.type)) {
      fileContent = await readImageFiles(file);
    } else if (file.type === "text/plain") {
      fileContent = await readFileAsText(file);
    } else {
      fileContent = await readFileAsText(file);
    }

    await handleFileContent(fileContent);
  }

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
    await new Promise((resolve) => setTimeout(resolve, 400));
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
        await new Promise((resolve) => setTimeout(resolve, WAIT_TIME));
        await submitConversation(chunk, part, i === numChunks - 1, numChunks);

        setCurrentPart(part);
        let chatgptReady = false;
        while (!chatgptReady && !isStopRequestedRef.current) {
          await new Promise((resolve) => setTimeout(resolve, WAIT_TIME));
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
        setTotalParts(0);
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

  const onFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
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

  async function onChunkSizeChange(value: string) {
    let parsedValue = parseInt(value);

    if (isNaN(parsedValue)) {
      return;
    }

    if (parsedValue < 1) {
      parsedValue = 1;
    }

    if (parsedValue > 99999) {
      parsedValue = 99999;
    }

    await saveToLocalStorage("chatGPTFileUploader_chunkSize", parsedValue);
    setChunkSize(parsedValue);
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
    handleFileInput,
    multipleFilesUpPrompt,
    setMultipleFilesUpPrompt,
  };
};

export default useFileUploader;

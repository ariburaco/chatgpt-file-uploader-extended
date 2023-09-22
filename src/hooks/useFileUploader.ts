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
  DEFAULT_OVERLAP_SIZE,
} from "@src/helpers/constants";
import {
  readPdfFile,
  readWordFile,
  readExcelFile,
  readFilesFromZIPFile,
} from "@src/helpers/filereaders";
import { useEffect, useRef, useState } from "react";
import useGoogleAnalytics from "./useGoogleAnalytics";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { Document } from "langchain/document";
import { toast } from "react-hot-toast";

const useFileUploader = () => {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [chunkSize, setChunkSize] = useState<number>(DEFAULT_CHUNCK_SIZE);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [currentPart, setCurrentPart] = useState<number>(0);
  const [totalParts, setTotalParts] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

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
  const [overlapSize, setOverlapSize] = useState(DEFAULT_OVERLAP_SIZE);

  const { fireEvent } = useGoogleAnalytics();

  const getSettingsFromLocalStorage = async () => {
    const localChunkSize = await getFromLocalStorage<string>("chunkSize");

    const localOverlapSize = await getFromLocalStorage<number>("overlapSize");

    const localBasePrompt = await getFromLocalStorage<string>("basePrompt");

    const localSingleFilePrompt = await getFromLocalStorage<string>(
      "singleFilePrompt"
    );

    const localMultipleFilesPrompt = await getFromLocalStorage<string>(
      "multipleFilesPrompt"
    );

    const localLastPartPrompt = await getFromLocalStorage<string>(
      "lastPartPrompt"
    );

    const localMultipleFilesUpPrompt = await getFromLocalStorage<string>(
      "multipleFilesUpPrompt"
    );

    const localBlacklist = await getFromLocalStorage<string>("blacklist");

    const localIgnoreExtensions = await getFromLocalStorage<string>(
      "ignoreExtensions"
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

    if (localOverlapSize) {
      setOverlapSize(localOverlapSize);
    }
  };

  const updateLocalStorageSettings = async () => {
    await saveToLocalStorage("basePrompt", basePrompt);
    await saveToLocalStorage("singleFilePrompt", singleFilePrompt);
    await saveToLocalStorage("multipleFilesPrompt", multipleFilesPrompt);
    await saveToLocalStorage("lastPartPrompt", lastPartPrompt);
    await saveToLocalStorage("multipleFilesUpPrompt", multipleFilesUpPrompt);
  };

  const updateBlackListAndIgnoreExtensions = async () => {
    await saveToLocalStorage("blacklist", blacklist.join(","));
    await saveToLocalStorage("ignoreExtensions", ignoreExtensions.join(","));
  };

  async function handleSubmission(file: File) {
    await getSettingsFromLocalStorage();
    setIsSubmitting(true);

    setIsStopRequested(false);
    setTotalParts(0);
    setCurrentPart(0);
    let fileContent = "";
    try {
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
        fileContent = "";
        toast.error("Image files are not supported anymore.");
        clearState();
        return;
      } else if (file.type === "text/plain") {
        fileContent = await readFileAsText(file);
      } else {
        fileContent = await readFileAsText(file);
      }
    } catch (error) {
      console.error(error);
      const errorMessage = `Error occurred while reading file: ${error}`;
      setError(errorMessage);
      fireEvent("file_select_error", {
        error_message: errorMessage,
        file_type: file.type,
      });
      clearState();
      return;
    }

    if (fileContent.length === 0 || fileContent === "") {
      const errorMessage = "File content is empty. Aborting...";
      toast.error(errorMessage);

      setError(errorMessage);
      fireEvent("file_select_error", {
        error_message: errorMessage,
        file_type: file.type,
      });
      clearState();
      return;
    }

    try {
      await handleFileContent(fileContent);
    } catch (error) {
      console.error(error);
      const errorMessage = `Error occurred while submitting file: ${error}`;
      setError(errorMessage);
      fireEvent("file_upload_failed", {
        error_message: errorMessage,
        file_type: file.type,
      });
      clearState();
      return;
    }
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

    if (!textarea) {
      setError("Could not find the prompt textarea");
      return;
    }

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
    const prompt = `
${prePrompt}

${promptFilename} 
${promptPart}

${text}`;

    await simulateEnterKey(prompt.trim());
  }

  const splitToDocuments = async (
    text: string,
    chunkSize: number
  ): Promise<string[]> => {
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: chunkSize ?? DEFAULT_CHUNCK_SIZE,
      chunkOverlap: overlapSize ?? DEFAULT_OVERLAP_SIZE,
    });

    const docOutput = await splitter.splitDocuments([
      new Document({ pageContent: text }),
    ]);

    return docOutput.map((doc) => doc.pageContent);
  };

  const handleFileContent = async (fileContent: string) => {
    const numChunks = Math.ceil(fileContent.length / chunkSize);
    setTotalParts(numChunks);
    const maxTries = 20; // Set max tries to 20

    const splittedDocuments = await splitToDocuments(fileContent, chunkSize);

    async function processChunk(i: number) {
      if (i < numChunks && !isStopRequestedRef.current) {
        const chunk = splittedDocuments[i];
        const part = i + 1;

        // Submit chunk to conversation
        await submitConversation(chunk, part, i === numChunks - 1, numChunks);
        await wait();
        setCurrentPart(part);
        let chatgptReady = false;
        let currentTry = 0; // Initialize the counter

        while (!chatgptReady && !isStopRequestedRef.current) {
          await wait();
          chatgptReady = !document.querySelector(
            ".text-2xl > span:not(.invisible)"
          );
          currentTry += 1; // Increment the counter

          if (isStopRequestedRef.current) {
            fireEvent("file_upload_cancelled", {
              stopped_at_part: part.toString(),
            });
            break;
          }
        }

        if (currentTry >= maxTries) {
          console.error("Max tries exceeded. Exiting...");
          setError("Max tries exceeded. Exiting...");
          clearState();
          return; // Exit the function or handle this case appropriately
        }

        if (!isStopRequestedRef.current) {
          processChunk(i + 1); // Process the next chunk
        }
      } else {
        clearState();
      }
    }

    processChunk(0); // Start the process with the first chunk
  };

  const clearState = () => {
    setIsSubmitting(false);
    setFile(null);
    setFileName("");
    setTotalParts(0);
    setCurrentPart(0);
  };

  const wait = (ms?: number) =>
    new Promise((resolve) => setTimeout(resolve, ms ?? WAIT_TIME));

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
      fireEvent("upload_button_clicked", {});
    }
  };

  async function onChunkSizeChange(value: string) {
    try {
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

      await saveToLocalStorage("chunkSize", parsedValue);
      setChunkSize(parsedValue);
    } catch (error) {
      setChunkSize(DEFAULT_CHUNCK_SIZE);
    }
  }

  async function onOverlapSizeChange(value: string) {
    try {
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

      await saveToLocalStorage("overlapSize", parsedValue);
      setOverlapSize(parsedValue);
    } catch (error) {
      setOverlapSize(DEFAULT_OVERLAP_SIZE);
    }
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

  useEffect(() => {
    if (error) {
      const metrics = {
        file_type: file?.type || "",
        file_name: fileName,
      };

      fireEvent("file_upload_failed", {
        error_message: error,
        ...metrics,
      });
    }
  }, [error]);

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
    overlapSize,
    onOverlapSizeChange,
  };
};

export default useFileUploader;

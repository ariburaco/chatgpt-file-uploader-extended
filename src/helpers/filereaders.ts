/* eslint-disable @typescript-eslint/no-explicit-any */
import * as PDFJS from "pdfjs-dist";
PDFJS.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS.version}/pdf.worker.js`;

import OCRImage from "@src/helpers/OCRImage";
import { IMAGE_FILE_EXTENSIONS } from "@src/helpers/constants";
import JSZip from "jszip";
import { getDocument } from "pdfjs-dist";
import { read, utils } from "xlsx";

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

const readFilesFromZIPFile = async (
  zipFile: File,
  blacklist: string[],
  ignoreExtensions: string[]
): Promise<string> => {
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
          const pdf = await getDocument({ data: event.target.result }).promise;

          let textContent = "";
          for (let i = 1; i <= pdf.numPages; i++) {
            try {
              const page = await pdf.getPage(i);
              const text = await page.getTextContent();
              textContent += `Page ${i}:\n`;
              textContent += text.items.map((item: any) => item.str).join(" ");
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

export {
  readFilesFromZIPFile,
  readPdfFile,
  readWordFile,
  readExcelFile,
  readImageFiles,
};

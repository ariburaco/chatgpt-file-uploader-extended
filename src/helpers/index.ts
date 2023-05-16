export const convertBlobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.readAsDataURL(blob);
  });
};

export const saveToLocalStorage = async <T>(
  key: string,
  value: T
): Promise<void> => {
  await chrome.storage.local.set({ [key]: value });
};

export const getFromLocalStorage = <T>(key: string): Promise<T | undefined> => {
  return new Promise((resolve) => {
    chrome.storage.local.get([key], (result) => {
      resolve(result[key] as T);
    });
  });
};

export const removeItemFromLocalStorage = async (key: string) => {
  await chrome.storage.local.remove(key);
};

export const openLinkInNewTab = async (url: string) => {
  await chrome.tabs.create({ url });
};

export const dataURLToBlob = (dataURL: string) => {
  const [meta, base64] = dataURL.split(",");
  const [mimeType] = meta.split(";")[0].split(":");
  const binary = atob(base64);
  const length = binary.length;
  const buffer = new Uint8Array(length);

  for (let i = 0; i < length; i++) {
    buffer[i] = binary.charCodeAt(i);
  }

  return new Blob([buffer], { type: mimeType });
};

import { useEffect, useState } from "react";

const useChrome = () => {
  const [currentTab, setCurrentTab] = useState<chrome.tabs.Tab | null>(null);

  const getCurrentTab = async () => {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    setCurrentTab(tab);
  };

  const executeOnPage = async (func: any) => {
    if (!currentTab) {
      return null;
    }
    let result;
    try {
      [{ result }] = await chrome.scripting.executeScript({
        target: { tabId: currentTab.id! },
        func: func as (...args: any) => void,
      });
    } catch (e) {
      return null;
    }
    return result as ReturnType<typeof func>;
  };

  useEffect(() => {
    getCurrentTab();
  }, []);

  return {
    executeOnPage,
    currentTab,
  };
};

export default useChrome;

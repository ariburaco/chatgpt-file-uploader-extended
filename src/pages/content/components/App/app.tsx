import useFileUploader from "@src/hooks/useFileUploader";
import ProgressBar from "../ProgressBar";
import Settings from "../Settings";
import StopIcon from "../Icons/StopIcon";
import UploadIcon from "../Icons/UploadIcon";
import Popup from "../Popup";
import BuyMeACoffee from "../BuyMeACoffee";
import useGoogleAnalytics from "@src/hooks/useGoogleAnalytics";
import { useEffect } from "react";

export default function App() {
  const {
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
    setBlacklist,
    setIgnoreExtensions,
    updateBlackListAndIgnoreExtensions,
    setIsStopRequested,
    handleFileInput,
    multipleFilesUpPrompt,
    setMultipleFilesUpPrompt,
  } = useFileUploader();

  const { firePageViewEvent } = useGoogleAnalytics();

  useEffect(() => {
    firePageViewEvent(document.title, document.location.href);
  }, []);

  return (
    <>
      <Popup title="Wanna make a donation?">
        <div
          className="flex flex-col items-center justify-between gap-6"
          style={{
            marginTop: "10px",
          }}
        >
          <span className="text-gray-700 dark:text-gray-200 text-sm text-center">
            If you like the File Uploader extension,
            <br />
            you can support me with a coffee ☕
          </span>

          <BuyMeACoffee referrer="popup" />

          <span className="text-gray-700 dark:text-gray-200 text-xs">
            You will not see this message again after you close it.
          </span>
        </div>
      </Popup>
      <div
        className="flex flex-col items-center justify-center w-full h-full"
        style={{ marginLeft: 4 }}
      >
        <div
          className="py-2 flex flex-col md:flex-row items-center gap-2 w-full"
          style={{ justifyContent: "end" }}
        >
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={onFileChange}
            // accept={ACCEPTED_FILE_TYPES.join(", ")}
            accept="*"
          />

          <div className="flex flex-row items-center justify-start gap-1">
            <Settings
              onChunkSizeChange={onChunkSizeChange}
              chunkSize={chunkSize}
              basePrompt={basePrompt}
              singleFilePrompt={singleFilePrompt}
              multipleFilesPrompt={multipleFilesPrompt}
              lastPartPrompt={lastPartPrompt}
              setSingleFilePrompt={setSingleFilePrompt}
              setMultipleFilesPrompt={setMultipleFilesPrompt}
              multipleFilesUpPrompt={multipleFilesUpPrompt}
              setMultipleFilesUpPrompt={setMultipleFilesUpPrompt}
              setLastPartPrompt={setLastPartPrompt}
              setBasePrompt={setBasePrompt}
              updateLocalStorageSettings={updateLocalStorageSettings}
              blacklist={blacklist}
              ignoreExtensions={ignoreExtensions}
              setBlacklist={setBlacklist}
              setIgnoreExtensions={setIgnoreExtensions}
              updateBlackListAndIgnoreExtensions={
                updateBlackListAndIgnoreExtensions
              }
            />

            <button
              className={`text-white rounded-md w-fit hover:opacity-80 transition-all ${
                isSubmitting ? "cursor-not-allowed bg-gray-900" : "bg-green-500"
              }`}
              onClick={onUploadButtonClick}
              disabled={isSubmitting}
              style={{ height: "36px", padding: "0 8px" }}
              onDragOver={(e) => e.preventDefault()}
              onDragLeave={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                handleFileInput(e.dataTransfer.files);
              }}
            >
              <UploadIcon />
            </button>

            {isSubmitting && (
              <button
                className="text-white rounded-md w-fit hover:opacity-80 transition-all bg-red-500"
                onClick={() => setIsStopRequested(true)}
                style={{ height: "36px", padding: "0 8px" }}
              >
                <StopIcon />
              </button>
            )}
          </div>
        </div>
        <span className="text-gray-600 dark:text-gray-300 text-xs">
          {chunkSize} chars
        </span>
        {isSubmitting && totalParts > 0 && (
          <div className="progressbar-container flex flex-col items-center justify-center gap-2">
            <ProgressBar completed={currentPart} total={totalParts} />
            <span className="text-gray-600 dark:text-gray-300 text-xs">
              {currentPart} of {totalParts} parts uploaded
            </span>
          </div>
        )}
      </div>
    </>
  );
}

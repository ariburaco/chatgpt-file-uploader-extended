import useFileUploader from "@src/hooks/useFileUploader";
import ProgressBar from "../ProgressBar";
import Settings from "../Settings";
import { ACCEPTED_FILE_TYPES } from "@src/helpers/constants";

export default function App() {
  const {
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
    setBlacklist,
    setIgnoreExtensions,
    updateBlackListAndIgnoreExtensions,
    setIsStopRequested,
  } = useFileUploader();

  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      <div
        className="py-2 flex flex-col md:flex-row items-center gap-2 w-full"
        style={{ justifyContent: "end" }}
      >
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={onFileChange}
          accept={ACCEPTED_FILE_TYPES.join(", ")}
        />
        <span className="text-gray-600 dark:text-gray-300 text-sm">
          Chunk Size: {chunkSize} characters
        </span>
        <div className="flex flex-row items-center justify-start gap-2">
          <Settings
            onChunkSizeChange={onChunkSizeChange}
            chunkSize={chunkSize}
            basePrompt={basePrompt}
            singleFilePrompt={singleFilePrompt}
            multipleFilesPrompt={multipleFilesPrompt}
            multipleFilesUpPrompt={multipleFilesUpPrompt}
            lastPartPrompt={lastPartPrompt}
            setSingleFilePrompt={setSingleFilePrompt}
            setMultipleFilesPrompt={setMultipleFilesPrompt}
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
            onDragOver={(e) => e.preventDefault()}
            onDragLeave={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              handleFileInput(e.dataTransfer.files);
            }}
            disabled={isSubmitting}
            style={{ height: "40px", padding: "0 20px" }}
          >
            Upload File
          </button>
          {isSubmitting && (
            <button
              className="text-white rounded-md w-fit hover:opacity-80 transition-all bg-red-500"
              onClick={() => setIsStopRequested(true)}
              style={{ height: "40px", padding: "0 20px" }}
            >
              Stop Upload
            </button>
          )}
        </div>
      </div>
      {isSubmitting && totalParts > 0 && (
        <div className="flex flex-col items-center justify-center gap-2 w-full my-1">
          <ProgressBar completed={currentPart} total={totalParts} />
          <span className="text-gray-600 dark:text-gray-300 text-xs">
            {currentPart} of {totalParts} parts uploaded
          </span>
        </div>
      )}
    </div>
  );
}

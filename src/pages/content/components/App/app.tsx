import useFileUploader from "@src/hooks/useFileUploader";
import ProgressBar from "../ProgressBar";
import Settings from "../Settings";

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
          accept=".txt,.js,.py,.html,.css,.json,.csv,.md,.ts,.tsx,.jsx,.pdf,.doc,.docx,.xls,.xlsx,.zip"
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
            lastPartPrompt={lastPartPrompt}
            setSingleFilePrompt={setSingleFilePrompt}
            setMultipleFilesPrompt={setMultipleFilesPrompt}
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
            style={{ height: "40px", padding: "0 20px" }}
          >
            Upload File
          </button>
        </div>
      </div>
      {isSubmitting && (
        <div className="flex flex-col items-center justify-center gap-2 w-full my-1">
          <ProgressBar completed={currentPart} total={totalParts} />
          <span className="text-gray-600 dark:text-gray-300 text-xs">
            {currentPart} of {totalParts} parts uploaded
          </span>
        </div>
      )}

      <span className="hidden sm:block text-gray-600 dark:text-gray-300 text-xs">
        Supported file types:{" "}
        <span className="text-gray-500 dark:text-gray-500">
          .txt, .js, .py, .html, .css, .json, .csv, .md, .ts, .tsx, .jsx, .pdf,
          .doc, .docx, .xls, .xlsx and .zip
        </span>
      </span>
    </div>
  );
}

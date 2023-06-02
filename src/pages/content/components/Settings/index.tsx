import { Tab } from "@headlessui/react";
import { ACCEPTED_FILE_TYPES, PACKAGE_VERSION } from "@src/helpers/constants";
import classnames from "classnames";
import { Fragment, useState } from "react";
import { SettingsIcon } from "../Icons/SettingsIcon";
import Modal from "../Modal";

interface SettingsProps {
  chunkSize: number;
  basePrompt: string;
  singleFilePrompt: string;
  multipleFilesPrompt: string;
  lastPartPrompt: string;
  blacklist: string[];
  ignoreExtensions: string[];
  setSingleFilePrompt: (prompt: string) => void;
  setMultipleFilesPrompt: (prompt: string) => void;
  setLastPartPrompt: (prompt: string) => void;
  setBasePrompt: (prompt: string) => void;
  onChunkSizeChange: (chunkSize: number) => void;
  updateLocalStorageSettings: () => void;
  setBlacklist: (blacklist: string[]) => void;
  setIgnoreExtensions: (ignoreExtensions: string[]) => void;
  updateBlackListAndIgnoreExtensions: () => void;
}

const Settings = ({
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
  ignoreExtensions,
  blacklist,
  setIgnoreExtensions,
  setBlacklist,
  updateBlackListAndIgnoreExtensions,
}: SettingsProps) => {
  const [openModal, setOpenModal] = useState(false);

  const [ignoreExtensionsInput, setIgnoreExtensionsInput] = useState("");
  const [blacklistInput, setBlacklistInput] = useState("");

  return (
    <>
      <button
        className="text-green-500 hover:opacity-80"
        onClick={() => setOpenModal(true)}
      >
        <SettingsIcon />
      </button>
      <Modal
        title="ChatGPT File Uploader Settings"
        openModal={openModal}
        setOpenModal={setOpenModal}
      >
        <div className="w-full h-full">
          <Tab.Group>
            <Tab.List className="flex gap-2">
              <Tab as={Fragment}>
                {({ selected }) => (
                  /* Use the `selected` state to conditionally style the selected tab. */
                  <button
                    className={classnames(
                      "py-2 px-4 rounded-md bg-gray-100 dark:bg-gray-800",
                      selected ? "text-green-500" : "text-gray-500"
                    )}
                  >
                    General Settings
                  </button>
                )}
              </Tab>
              <Tab as={Fragment}>
                {({ selected }) => (
                  /* Use the `selected` state to conditionally style the selected tab. */
                  <button
                    className={classnames(
                      "py-2 px-4 rounded-md bg-gray-100 dark:bg-gray-800",
                      selected ? "text-green-500" : "text-gray-500"
                    )}
                  >
                    Prompts
                  </button>
                )}
              </Tab>
              <Tab as={Fragment}>
                {({ selected }) => (
                  /* Use the `selected` state to conditionally style the selected tab. */
                  <button
                    className={classnames(
                      "py-2 px-4 rounded-md bg-gray-100 dark:bg-gray-800",
                      selected ? "text-green-500" : "text-gray-500"
                    )}
                  >
                    ZIP File Settings
                  </button>
                )}
              </Tab>
              <Tab as={Fragment}>
                {({ selected }) => (
                  /* Use the `selected` state to conditionally style the selected tab. */
                  <button
                    className={classnames(
                      "py-2 px-4 rounded-md bg-gray-100 dark:bg-gray-800",
                      selected ? "text-green-500" : "text-gray-500"
                    )}
                  >
                    About
                  </button>
                )}
              </Tab>
            </Tab.List>
            <Tab.Panels>
              <Tab.Panel>
                <div className="flex flex-col items-start justify-center gap-4 w-full py-6 px-2">
                  <Row label="Chunk Size">
                    <input
                      type="number"
                      className="m-0 w-full resize-none border-0 bg-transparent p-0 pr-7 focus:ring-0 focus-visible:ring-0 dark:bg-transparent pl-2 md:pl-0"
                      placeholder="Enter number of chunk size"
                      value={chunkSize}
                      onChange={(e) =>
                        onChunkSizeChange(parseInt(e.target.value))
                      }
                    />
                  </Row>
                  <Divider />
                  <Row label="File Types">
                    <span className="text-gray-600 dark:text-gray-400 text-sm">
                      All the supported extensions are listed below.
                    </span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {ACCEPTED_FILE_TYPES.map((fileType, index) => (
                        <span key={index} className="text-green-500 text-xs">
                          {fileType}
                        </span>
                      ))}
                    </div>
                  </Row>
                  <Divider />
                  <span className="text-gray-600 dark:text-gray-400 text-sm">
                    If the file type is not supported, it will be ignored.
                    Unless if the file is a plain text file, you can select it
                    to be uploaded, it will automatically read the whole text of
                    the file.
                  </span>
                </div>
              </Tab.Panel>

              <Tab.Panel>
                <div className="flex flex-col items-start justify-center gap-4 w-full py-6 px-2">
                  <Row label="Base Prompt">
                    <textarea
                      rows={2}
                      className="m-0 w-full resize-none border-0 bg-transparent p-0 pr-7 focus:ring-0 focus-visible:ring-0 dark:bg-transparent pl-2 md:pl-0"
                      placeholder="Enter the base prompt"
                      value={basePrompt}
                      onChange={(e) => setBasePrompt(e.target.value)}
                    />
                  </Row>
                  <Row label="Single Part Prompt">
                    <textarea
                      rows={2}
                      className="m-0 w-full resize-none border-0 bg-transparent p-0 pr-7 focus:ring-0 focus-visible:ring-0 dark:bg-transparent pl-2 md:pl-0"
                      placeholder="Enter the single file prompt"
                      value={singleFilePrompt}
                      onChange={(e) => setSingleFilePrompt(e.target.value)}
                    />
                  </Row>
                  <Row label="Multi Part Prompt">
                    <textarea
                      rows={2}
                      className="m-0 w-full resize-none border-0 bg-transparent p-0 pr-7 focus:ring-0 focus-visible:ring-0 dark:bg-transparent pl-2 md:pl-0"
                      placeholder="Enter the multi file prompt"
                      value={multipleFilesPrompt}
                      onChange={(e) => setMultipleFilesPrompt(e.target.value)}
                    />
                  </Row>
                  <Row label="Last Part Prompt">
                    <textarea
                      rows={2}
                      className="m-0 w-full resize-none border-0 bg-transparent p-0 pr-7 focus:ring-0 focus-visible:ring-0 dark:bg-transparent pl-2 md:pl-0"
                      placeholder="Enter the multi file prompt"
                      value={lastPartPrompt}
                      onChange={(e) => setLastPartPrompt(e.target.value)}
                    />
                  </Row>
                  <Divider />
                </div>
                <div className="flex flex-row items-center justify-end gap-4 w-full p-2">
                  <span className="m-0 text-gray-500 dark:text-gray-400 text-sm">
                    Note: Dont forget the Save the settings
                  </span>
                  <button
                    className="bg-green-500 text-white rounded-md w-fit hover:opacity-80 transition-all self-end"
                    style={{ height: "40px", padding: "0 20px" }}
                    onClick={() => {
                      updateLocalStorageSettings();
                    }}
                  >
                    Save
                  </button>
                </div>
              </Tab.Panel>
              <Tab.Panel>
                <div className="flex flex-col items-start justify-center gap-4 w-full py-6 px-2">
                  <Row label="Ignore File extensions in the ZIP File">
                    <input
                      type="text"
                      className="m-0 w-full resize-none border-0 bg-transparent p-0 pr-7 focus:ring-0 focus-visible:ring-0 dark:bg-transparent pl-2 md:pl-0"
                      placeholder="Add file extensions to ignore"
                      value={ignoreExtensionsInput}
                      onChange={(e) => {
                        setIgnoreExtensionsInput(e.target.value);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          setIgnoreExtensions([
                            ...ignoreExtensions,
                            ignoreExtensionsInput,
                          ]);
                          setIgnoreExtensionsInput("");
                        }
                      }}
                    />
                  </Row>
                  <div className="flex flex-wrap gap-2">
                    {ignoreExtensions.map((file) => (
                      <div
                        className="py-1 px-2 text-xs bg-gray-100 dark:bg-gray-800 flex rounded-full"
                        key={file}
                      >
                        <button
                          className="hover:opacity-80 transition-all"
                          onClick={() => {
                            setIgnoreExtensions(
                              ignoreExtensions.filter((f) => f !== file)
                            );
                          }}
                        >
                          <span className="m-0 text-gray-500 dark:text-gray-400">
                            {file}
                          </span>
                        </button>
                      </div>
                    ))}
                  </div>
                  <Divider />
                  <Row label="Ignore Specific Files in the ZIP File">
                    <input
                      type="text"
                      className="m-0 w-full resize-none border-0 bg-transparent p-0 pr-7 focus:ring-0 focus-visible:ring-0 dark:bg-transparent pl-2 md:pl-0"
                      placeholder="Add file extensions to ignore"
                      value={blacklistInput}
                      onChange={(e) => {
                        setBlacklistInput(e.target.value);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          setBlacklist([...blacklist, blacklistInput]);
                          setBlacklistInput("");
                        }
                      }}
                    />
                  </Row>
                  <div className="flex flex-wrap gap-2">
                    {blacklist.map((file) => (
                      <div
                        className="py-1 px-2 text-xs bg-gray-100 dark:bg-gray-800 flex rounded-full"
                        key={file}
                      >
                        <button
                          className="hover:opacity-80 transition-all"
                          onClick={() => {
                            setBlacklist(blacklist.filter((f) => f !== file));
                          }}
                        >
                          <span className="m-0 text-gray-500 dark:text-gray-400">
                            {file}
                          </span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex flex-row items-center justify-end gap-4 w-full p-2">
                  <span className="m-0 text-gray-500 dark:text-gray-400 text-sm">
                    Note: Dont forget the Save the settings
                  </span>
                  <button
                    className="bg-green-500 text-white rounded-md w-fit hover:opacity-80 transition-all self-end"
                    style={{ height: "40px", padding: "0 20px" }}
                    onClick={() => {
                      updateBlackListAndIgnoreExtensions();
                    }}
                  >
                    Save
                  </button>
                </div>
              </Tab.Panel>
              <Tab.Panel>
                <div className="flex flex-col items-start justify-center gap-4 w-full py-6 px-2">
                  <Row label="Version">
                    <p className="m-0 text-gray-500 dark:text-gray-400">
                      {PACKAGE_VERSION}
                    </p>
                  </Row>
                  <Row label="GitHub">
                    <a
                      href="https://github.com/ariburaco/chatgpt-file-uploader"
                      target="_blank"
                      rel="noreferrer"
                      className="m-0 text-gray-500 dark:text-gray-400 hover:opacity-80 transition-all"
                    >
                      ariburaco/chatgpt-file-uploader-extended
                    </a>
                  </Row>
                  <Divider />
                </div>
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        </div>
      </Modal>
    </>
  );
};

export default Settings;

const Divider = () => {
  return (
    <div className="w-full border-b border-black/10 dark:border-white/10" />
  );
};

const Row = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => {
  return (
    <div className="flex flex-col gap-2 items-start justify-start w-full">
      <label className="text-gray-600 dark:text-gray-300 text-sm text-left">
        {label}
      </label>
      <div className="flex flex-col w-full py-2 flex-grow md:py-3 md:pl-4 relative border border-black/10 bg-white dark:border-gray-900/50 dark:text-white dark:bg-gray-700 rounded-md shadow-[0_0_10px_rgba(0,0,0,0.10)] dark:shadow-[0_0_15px_rgba(0,0,0,0.10)]">
        {children}
      </div>
    </div>
  );
};

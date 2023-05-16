import { createRoot } from "react-dom/client";
import App from "@src/pages/content/components/App/app";
// import refreshOnUpdate from "virtual:reload-on-update-in-view";

// refreshOnUpdate("pages/content/components/App");

const root = document.createElement("div");
root.id = "chatGPT-file-uploader-root";
root.classList.add("flex");
root.classList.add("flex-row");
root.classList.add("justify-end");
root.classList.add("items-center");

const chatBox = document.querySelector(
  "#__next > div > div > div > main > div > form > div"
);

const observer = new MutationObserver((mutationsList, observer) => {
  // Look through all mutations that just occured
  for (const mutation of mutationsList) {
    // If the addedNode property has a value
    if (mutation.addedNodes.length) {
      if (!document.getElementById(root.id)) {
        const chatBox = document.querySelector(
          "#__next > div > div > div > main > div > form > div"
        );

        if (chatBox) {
          chatBox.append(root);
          createRoot(root).render(<App />);
        }
      }
    }
  }
});

// Start observing the document with the configured parameters
observer.observe(document, { childList: true, subtree: true });

if (chatBox) {
  chatBox.append(root);
  createRoot(root).render(<App />);
}

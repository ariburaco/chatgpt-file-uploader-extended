import { EXTENSION_PREFIX } from "@src/helpers/constants";
import useGoogleAnalytics from "@src/hooks/useGoogleAnalytics";
import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useState } from "react";

interface PopupProps {
  title: string;
  children: React.ReactNode;
}

const Popup: React.FC<PopupProps> = ({ title, children }) => {
  const [showPopup, setShowPopup] = useState(false);
  const { fireEvent } = useGoogleAnalytics();

  useEffect(() => {
    checkPopupClosed();
  }, []);

  const checkPopupClosed = async () => {
    const isPopupClosed = localStorage.getItem(
      `${EXTENSION_PREFIX}_isPopupClosed`
    );

    const popupShown = isPopupClosed === "false" || isPopupClosed === null;
    setShowPopup(popupShown);
  };

  const onPopupClose = async () => {
    setShowPopup(false);
    localStorage.setItem(`${EXTENSION_PREFIX}_isPopupClosed`, "true");
    fireEvent("popup_closed", {});
  };

  const containerVariants = {
    hidden: {
      opacity: 0,
      y: 250,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        type: "spring",
        damping: 10,
        stiffness: 100,
      },
    },
  };

  return (
    <AnimatePresence mode="wait">
      {showPopup && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          className="dark:bg-gray-700"
          style={{
            position: "fixed",
            right: "20px",
            bottom: "60px",
            padding: "8px 12px",
            boxShadow: "0 0 15px rgba(0, 0, 0, 0.2)",
            border: "0.5px solid rgba(0, 0, 0, 0.1)",
            borderRadius: "5px",
            width: "280px",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h3 className="text-gray-800 dark:text-gray-200 text-base font-bold">
              {title}
            </h3>
            <button
              className="text-gray-500 hover:opacity-80 transition-all"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "24px",
              }}
              onClick={onPopupClose}
            >
              &times;
            </button>
          </div>
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Popup;

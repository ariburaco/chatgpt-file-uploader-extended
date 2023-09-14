import Analytics from "@src/helpers/google-analytics";
import { useCallback } from "react";

const useGoogleAnalytics = () => {
  const fireEvent = useCallback(
    async (eventName: string, eventParams: Record<string, string>) => {
      try {
        Analytics.fireEvent(eventName, eventParams);
      } catch (error) {
        console.error(error);
      }
    },
    []
  );

  const firePageViewEvent = useCallback(
    async (pageTitle: string, pageLocation: string) => {
      try {
        Analytics.firePageViewEvent(pageTitle, pageLocation);
      } catch (error) {
        console.error(error);
      }
    },
    []
  );

  return { fireEvent, firePageViewEvent };
};

export default useGoogleAnalytics;

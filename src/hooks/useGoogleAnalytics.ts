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

  const fireErrorEvent = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (error: any, additionalParams: Record<string, string>) => {
      try {
        Analytics.fireErrorEvent(error, additionalParams);
      } catch (error) {
        console.error(error);
      }
    },
    []
  );

  return { fireEvent, firePageViewEvent, fireErrorEvent };
};

export default useGoogleAnalytics;

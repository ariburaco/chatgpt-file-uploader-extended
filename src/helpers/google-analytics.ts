/* eslint-disable @typescript-eslint/no-explicit-any */
import { getFromLocalStorage, saveToLocalStorage } from ".";

const GA_ENDPOINT = "https://www.google-analytics.com/mp/collect";
const GA_DEBUG_ENDPOINT = "https://www.google-analytics.com/debug/mp/collect";

const MEASUREMENT_ID = "YOUR_MEASUREMENT_ID_HERE";
const API_SECRET = "YOUR_API_SECRET_HERE";

const DEFAULT_ENGAGEMENT_TIME_MSEC = 100;
const SESSION_EXPIRATION_IN_MIN = 30;

export interface SessionData {
  session_id: string;
  timestamp: string;
}

interface EventParams {
  session_id?: string;
  engagement_time_msec?: number;
  page_title?: string;
  page_location?: string;
  [key: string]: any; // To allow for other parameters
}

export class Analytics {
  private debug: boolean;

  constructor(debug = false) {
    this.debug = debug;
  }

  async getOrCreateClientId(): Promise<string> {
    const clientId = await getFromLocalStorage<string>("clientId");
    if (!clientId) {
      const newClientId = self.crypto.randomUUID();
      await saveToLocalStorage("clientId", newClientId);
      return newClientId;
    }
    return clientId;
  }

  async getOrCreateSessionId(): Promise<string> {
    let sessionData = await getFromLocalStorage<SessionData>("sessionData");

    const currentTimeInMs = Date.now();
    if (sessionData && sessionData.timestamp) {
      const durationInMin =
        (currentTimeInMs - parseInt(sessionData.timestamp)) / 60000;
      if (durationInMin > SESSION_EXPIRATION_IN_MIN) {
        sessionData = undefined;
      } else {
        sessionData.timestamp = currentTimeInMs.toString();
        await saveToLocalStorage("sessionData", sessionData);
      }
    }
    if (!sessionData) {
      const newSessionData: SessionData = {
        session_id: currentTimeInMs.toString(),
        timestamp: currentTimeInMs.toString(),
      };
      await saveToLocalStorage("sessionData", newSessionData);
      return newSessionData.session_id;
    }
    return sessionData.session_id;
  }

  public async fireEvent(
    name: string,
    params: EventParams = {}
  ): Promise<void> {
    if (!params.session_id) {
      params.session_id = await this.getOrCreateSessionId();
    }
    if (!params.engagement_time_msec) {
      params.engagement_time_msec = DEFAULT_ENGAGEMENT_TIME_MSEC;
    }

    try {
      const response = await fetch(
        `${
          this.debug ? GA_DEBUG_ENDPOINT : GA_ENDPOINT
        }?measurement_id=${MEASUREMENT_ID}&api_secret=${API_SECRET}`,
        {
          method: "POST",
          body: JSON.stringify({
            client_id: await this.getOrCreateClientId(),
            events: [
              {
                name,
                params: {
                  ...params,
                },
              },
            ],
          }),
        }
      );
      if (this.debug) {
        console.log(await response.text());
      }
    } catch (e) {
      console.error("Google Analytics request failed with an exception", e);
    }
  }

  public async firePageViewEvent(
    pageTitle: string,
    pageLocation: string,
    additionalParams: EventParams = {}
  ): Promise<void> {
    return this.fireEvent("page_view", {
      page_title: pageTitle,
      page_location: pageLocation,
      ...additionalParams,
    });
  }
}

export default new Analytics();

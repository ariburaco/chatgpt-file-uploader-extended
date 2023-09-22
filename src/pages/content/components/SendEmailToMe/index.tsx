import { getFromLocalStorage, isValidEmail } from "@src/helpers";
import {
  EMAIL_ENDPOINT,
  EXTENSION_PREFIX,
  PACKAGE_VERSION,
} from "@src/helpers/constants";
import { SessionData } from "@src/helpers/google-analytics";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { Row } from "../Settings";

const SendEmailToMe = () => {
  const [emailSent, setEmailSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    if (!formData.get("name")) {
      toast.error("Please enter your name");
      return;
    }

    if (!formData.get("email")) {
      toast.error("Please enter your email");
      return;
    }

    if (!isValidEmail(formData.get("email") as string)) {
      toast.error("Please enter a valid email");
      return;
    }

    if (!formData.get("message")) {
      toast.error("Please enter your message");
      return;
    }

    const sessionData = await getFromLocalStorage<SessionData>("sessionData");

    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      message: formData.get("message"),
      extensionName: EXTENSION_PREFIX,
      extensionVersion: PACKAGE_VERSION,
      sessionId: sessionData?.session_id,
    };

    toast.promise(sendEmail(data), {
      loading: "Sending...",
      success: "Message sent",
      error: "Message could not be sent",
    });
  };

  const sendEmail = async (data: any): Promise<boolean> => {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      try {
        setIsSubmitting(true);

        const response = await fetch(EMAIL_ENDPOINT, {
          method: "POST",
          headers: {
            "Access-Control-Allow-Origin": "*",
            "no-cors": "true",
            "Content-Type": "application/json",
            "session-id": data.sessionId || "",
          },
          body: JSON.stringify(data),
        });

        if (response.ok) {
          setEmailSent(true);
          setIsSubmitting(false);
          resolve(true);
        } else {
          setIsSubmitting(false);
          reject(false);
        }
      } catch (error: any) {
        setIsSubmitting(false);
        reject(false);
      }
    });
  };

  if (emailSent) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 w-full py-6 px-2">
        <span className="text-gray-700 dark:text-gray-200 text-sm text-center">
          Thank you for your message. I will get back to you as soon as
          possible.
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-6 w-full py-6 px-2">
      <span className="text-gray-700 dark:text-gray-200 text-center">
        If you are having any issues or suggestions, you can contact me.
      </span>

      <form
        className="flex flex-col items-start justify-start gap-4"
        style={{ width: "60%" }}
        onSubmit={onFormSubmit}
      >
        <Row label="Name">
          <input
            maxLength={50}
            name="name"
            type="text"
            className="m-0 w-full resize-none border-0 bg-transparent py-1 pr-7 focus:ring-0 focus-visible:ring-0 dark:bg-transparent"
            placeholder="Your name"
          />
        </Row>
        <Row label="Email">
          <input
            maxLength={100}
            name="email"
            type="email"
            className="m-0 w-full resize-none border-0 bg-transparent py-1 pr-7 focus:ring-0 focus-visible:ring-0 dark:bg-transparent"
            placeholder="Your email"
          />
        </Row>
        <Row label="Message">
          <textarea
            maxLength={500}
            name="message"
            rows={4}
            className="m-0 w-full resize-none border-0 bg-transparent py-1 pr-7 focus:ring-0 focus-visible:ring-0 dark:bg-transparent"
            placeholder="Message"
          />
        </Row>
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-green-500 text-white rounded-md hover:opacity-80 transition-all w-full disabled:opacity-40"
          style={{ height: "40px", padding: "0 20px" }}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default SendEmailToMe;

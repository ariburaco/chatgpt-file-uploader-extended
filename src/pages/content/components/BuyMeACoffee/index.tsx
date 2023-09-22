import useGoogleAnalytics from "@src/hooks/useGoogleAnalytics";
import { useEffect } from "react";

interface BuyMeACoffeeProps {
  referrer: "popup" | "settings";
}

const BuyMeACoffee = ({ referrer }: BuyMeACoffeeProps) => {
  const { fireEvent } = useGoogleAnalytics();

  const shownEventName =
    referrer === "popup"
      ? "buy_me_a_coffee_shown_from_popup"
      : "buy_me_a_coffee_shown_from_settings";

  const clickedEventName =
    referrer === "popup"
      ? "buy_me_a_coffee_clicked_from_popup"
      : "buy_me_a_coffee_clicked_from_settings";

  const onBuyMeACoffeeClick = () => {
    fireEvent(clickedEventName, { referrer });
  };

  useEffect(() => {
    fireEvent(shownEventName, { referrer });
  }, []);

  return (
    <a
      href={`https://www.buymeacoffee.com/aliburakozden?ref=chatgpt-file-uploader-extension-${referrer}`}
      target="_blank"
      rel="noreferrer"
      className="hover:opacity-80 transition-all"
      onClick={onBuyMeACoffeeClick}
    >
      <img
        src="https://cdn.buymeacoffee.com/buttons/v2/default-red.png"
        alt="Buy Me A Coffee"
        style={{
          height: 40,
          width: 140,
          objectFit: "contain",
        }}
      />
    </a>
  );
};

export default BuyMeACoffee;

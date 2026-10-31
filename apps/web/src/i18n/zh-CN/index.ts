// Each area keeps its own file so translations can be edited independently.
import chat from "./chat";
import common from "./common";
import misc from "./misc";
import onboarding from "./onboarding";
import settings from "./settings";
import settingsProviders from "./settings-providers";
import sidebar from "./sidebar";
import ui from "./ui";

const zhCN: Readonly<Record<string, string>> = {
  ...common,
  ...ui,
  ...sidebar,
  ...settings,
  ...settingsProviders,
  ...chat,
  ...onboarding,
  ...misc,
};

export default zhCN;

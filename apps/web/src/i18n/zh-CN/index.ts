// Each area keeps its own file so translations can be edited independently.
import chat from "./chat";
import chatExtra from "./chat-extra";
import common from "./common";
import misc from "./misc";
import miscExtra from "./misc-extra";
import onboarding from "./onboarding";
import pullRequest from "./pull-request";
import settings from "./settings";
import settingsExtra from "./settings-extra";
import settingsExtra2 from "./settings-extra2";
import settingsProviders from "./settings-providers";
import sidebar from "./sidebar";
import ui from "./ui";
import workspace from "./workspace";

const zhCN: Readonly<Record<string, string>> = {
  ...common,
  ...ui,
  ...sidebar,
  ...settings,
  ...settingsProviders,
  ...chat,
  ...onboarding,
  ...misc,
  ...pullRequest,
  ...settingsExtra,
  ...settingsExtra2,
  ...chatExtra,
  ...workspace,
  ...miscExtra,
};

export default zhCN;

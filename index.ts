import { Elysia } from "elysia";
import { cron } from "@elysiajs/cron";
import axios from "axios";
import { format } from "date-fns";

/**
 * Cron job to check ScriptHookV version
 * Runs every day at 17:00
 */
const cronJob = {
  name: "Check ScriptHookV version",
  pattern: "0 0 17 * * *",
  run() {
    checkScriptHookVersion();
  },
};

new Elysia().use(cron(cronJob)).listen(4000);

/**
 * Check ScriptHookV version
 * If the version is released today, send a webhook to Discord
 * @returns
 */
const checkScriptHookVersion = async (): Promise<void> => {
  console.log("Check script hook version");
  const url = "http://dev-c.com/gtav/scripthookv/";

  const response = await axios.get(url);

  const html = response.data;
  const version: string | undefined = html.match(/v\d+\.\d+\.\d+/g)[0];
  const releaseDate: string | undefined = html.match(/\d{4}-\d{2}-\d{2}/g)[0];

  if (releaseDate === format(new Date(), "yyyy-MM-dd")) {
    sendWebhook(version ?? "Not found", releaseDate ?? "Not found");
  }
};

/**
 * Send a webhook to Discord
 * @param {string} version - ScriptHookV version
 * @param {string} releaseDate - ScriptHookV release date
 * @returns
 */
const sendWebhook = async (
  version: string,
  releaseDate: string
): Promise<void> => {
  const id = "1184200302300254218";
  const token =
    "Mm1DYULSOptO40s1xUjcc7JChJJlClnIkaRU1C-jpfjLTk0e9CTjofYfwyy8LLUfztng";
  const url = `https://discordapp.com/api/webhooks/${id}/${token}`;

  const data = {
    content: `ScriptHookV ${version} released on ${releaseDate}`,
    username: "ScriptHookV",
  };

  await axios.post(url, data);
};

console.log("Server is running on port 4000");

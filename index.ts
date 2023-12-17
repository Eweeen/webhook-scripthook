import { Elysia } from "elysia";
import { cron } from "@elysiajs/cron";
import axios from "axios";
import { format } from "date-fns";

/**
 * Cron job to check ScriptHookV version
 * Runs every day at 17:00
 */
const cronJob = (pattern: string) => {
  return {
    name: "Check ScriptHookV version",
    pattern,
    run() {
      checkScriptHookVersion();
    },
  };
};

new Elysia()
  .use(cron(cronJob("0 0 17-21 * * 1-5")))
  .use(cron(cronJob("0 0 12-22 * * 6,7")))
  .listen(4000);

/**
 * Check ScriptHookV version
 * If the version is released today, send a webhook to Discord
 * @returns
 */
const checkScriptHookVersion = async (): Promise<void> => {
  const file = Bun.file("version.txt");

  const response = await axios.get("http://dev-c.com/gtav/scripthookv/");
  const html = response.data;

  const version: string | undefined = html.match(/v\d+\.\d+\.\d+\.\d+/g)[0];
  const releaseDate: string | undefined = html.match(/\d{4}-\d{2}-\d{2}/g)[0];

  if (!version) {
    console.log("Version not found");
    return;
  }

  if (file.size === 0) {
    Bun.write("version.txt", version);
  }

  const currentVersion = await file.text();

  if (
    releaseDate === format(new Date(), "yyyy-MM-dd") &&
    version !== currentVersion
  ) {
    sendWebhook(version, releaseDate ?? "Not found");
    Bun.write("version.txt", version);
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
    content: `ScriptHookV ${version} released on ${releaseDate} | http://dev-c.com/gtav/scripthookv/`,
    username: "ScriptHookV",
  };

  await axios.post(url, data);
};

console.log("Server is running on port 4000");

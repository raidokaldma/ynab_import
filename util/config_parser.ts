import { join } from "../deps.ts";

export interface Config {
  "revolut": {
    "phoneNumber": string;
    "password": string;
  };
  "swedbank": {
    "userId": string;
    "socialSecurityId": string;
  };
  "ynab": {
    "apiKey": string;
    "budgetId": string;
    "accountIds": {
      "revolut": string;
      "swedbank": string;
    };
  };
}

export async function readConfigOrExit(): Promise<Config> {
  const dirnameAbsolutePath = new URL(".", Deno.mainModule).pathname;
  const configFileAbsolutePath = join(dirnameAbsolutePath, "config.json");

  try {
    const config: Config = JSON.parse(
      await Deno.readTextFile(configFileAbsolutePath),
    );
    return config;
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      console.error(`😵 Make sure file ${configFileAbsolutePath} exists.`);
      Deno.exit(1);
    }
    throw error;
  }
}

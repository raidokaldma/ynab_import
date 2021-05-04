import { delay } from "../deps.ts";
import { AccountStatement } from "../types.ts";
import { logProgress, stopProgress } from "../util/log_progress.ts";

export async function fetchAccountStatement(): Promise<AccountStatement> {
  try {
    logProgress("Logging in");
    await delay(1000);

    logProgress("Fetching transactons");
    await delay(1000);

    return {
      transactions: [
        {
          date: new Date(),
          amount: 123.45,
          payerOrPayee: "Max E. Mumm",
          description: "¯\\_(ツ)_/¯",
        },
        {
          date: new Date(),
          amount: -250,
          payerOrPayee: "Hans Ohff",
          description: "(╯°□°)╯︵ ┻━┻",
        },
      ],
      summary: {
        availableAmount: 3497.48,
        reservedAmount: 2.52,
      },
    };
  } finally {
    stopProgress();
  }
}

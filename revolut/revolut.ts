import { ky, uuid } from "../deps.ts";
import { AccountStatement, Summary, Transaction } from "../types.ts";
import { logProgress, stopProgress } from "../util/log_progress.ts";
import { RevolutTransaction, SignIn, Token, Wallet } from "./types.ts";

const kyWithDefaults = ky.create({
  headers: {
    "user-agent": "Chrome/87.0.4280.101 github.com/raidokaldma/ynab_import",
    "x-device-id": uuid.generate(),
    "x-browser-application": "WEB_CLIENT",
    "x-client-version": "100.0",
  },
});

/** Fetches Revolut transactions. Requires log in confirmation on the phone. */
export async function fetchAccountStatement(
  phone: string,
  password: string,
): Promise<AccountStatement> {
  try {
    logProgress("Confirm log in on your phone, waiting...");
    const token = await acquireToken(phone, password);

    logProgress("Fetching transactions");
    const revolutTransactions = await getRevolutTransactions(token);
    const wallet = await getWallet(token);

    return {
      transactions: toTransactions(revolutTransactions),
      summary: toSummary(wallet),
    };
  } finally {
    stopProgress();
  }
}

async function acquireToken(phone: string, password: string): Promise<Token> {
  // Step 1
  const { tokenId }: SignIn = await kyWithDefaults.post(
    "https://app.revolut.com/api/retail/signin",
    { json: { phone, password, channel: "APP" } },
  ).json<SignIn>();

  // Step 2 - retry with exponential backoff until API returns token (HTTP status 200)
  const token: Token = await kyWithDefaults.post(
    "https://app.revolut.com/api/retail/token",
    {
      retry: {
        methods: ["post"],
        statusCodes: [422], // API returns status 422 while user has not yet approved sign in
        limit: 10,
      },
      json: { password, phone, tokenId },
    },
  ).json<Token>();

  return token;
}

async function getRevolutTransactions(
  token: Token,
): Promise<RevolutTransaction[]> {
  const fromDate: number = Date.now() - 60 * 24 * 60 * 60 * 1000; // last 30 days

  return await kyWithAuth(token).get(
    `https://api.revolut.com/user/current/transactions?count=500&from=${fromDate}`,
  ).json<RevolutTransaction[]>();
}

async function getWallet(token: Token) {
  return await kyWithAuth(token).get(
    "https://api.revolut.com/user/current/wallet",
  ).json<Wallet>();
}

function kyWithAuth(token: Token) {
  return kyWithDefaults.extend({
    headers: {
      "Authorization": "Basic " + btoa(token.user.id + ":" + token.accessToken),
    },
  });
}

function toTransactions(
  revolutTransactions: RevolutTransaction[],
): Transaction[] {
  const transactions: Transaction[] = revolutTransactions
    .filter((t) => t.currency === "EUR")
    .filter((t) => t.state === "COMPLETED" || t.state === "PENDING")
    .map((t) => {
      const date = new Date(t.startedDate);
      const amount = (t.amount - t.fee) / 100.0;
      const payerOrPayee = getPayerOrPayee(t);
      const description = t?.comment ?? t.description;

      return {
        amount,
        date,
        description,
        payerOrPayee,
      } as Transaction;
    });

  return transactions;
}

function getPayerOrPayee(transaction: RevolutTransaction): string {
  if (transaction.sender) {
    return `${transaction.sender.firstName} ${transaction.sender.lastName}`;
  }
  if (transaction.recipient) {
    return `${transaction.recipient.firstName} ${transaction.recipient.lastName}`;
  }
  if (transaction.merchant) {
    return `${transaction.merchant.name}, ${transaction.merchant.city}, ${transaction.merchant.country}`;
  }

  return transaction.description;
}

function toSummary(wallet: Wallet): Summary {
  const [pocket] = wallet.pockets
    .filter((pocket) => pocket.currency === "EUR")
    .filter((pocket) => pocket.state === "ACTIVE");

  // Revolut API returns amounts in cents
  const balance = pocket.balance / 100.0;
  const blockedAmount = pocket.blockedAmount / 100.0;
  return {
    availableAmount: balance,
    reservedAmount: blockedAmount,
  };
}

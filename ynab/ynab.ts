import { format, ky, parse } from "../deps.ts";
import { Transaction } from "../types.ts";
import {
  YnabTransaction,
  YnabTransactionsRequest,
  YnabTransactionsResponse,
} from "./types.ts";

export type SendTransactionsToYnabOptions = {
  budgetId: string;
  accountId: string;
  apiKey: string;
};

/** Sends transactions to YNAB, returns transactions that were new */
export async function sendTransactionsToYnab(
  transactions: Transaction[],
  { budgetId, accountId, apiKey }: SendTransactionsToYnabOptions,
): Promise<Transaction[]> {
  const ynabTransactions = toYnabTransactions(transactions, accountId);
  const response = await postTransactions(budgetId, apiKey, {
    transactions: ynabTransactions,
  });

  // Return imported (new) transactions
  return fromYnabTransactions(response.data.transactions);
}

function toYnabTransactions(
  transactions: Transaction[],
  accountId: string,
): YnabTransaction[] {
  const generateImportId = importIdGenerator();

  return transactions.map((t): YnabTransaction => ({
    account_id: accountId,
    amount: toMilliAmount(t.amount),
    date: formatDate(t.date),
    memo: t.description?.substr(0, 200),
    payee_name: t.payerOrPayee?.substr(0, 50),
    import_id: generateImportId(t.amount, t.date),
  }));
}

function importIdGenerator() {
  const occurence: Record<string, number> = {};
  return (amount: number, date: Date): string => {
    const importId = `YNAB:${toMilliAmount(amount)}:${formatDate(date)}`;
    occurence[importId] ??= 1;
    // From YNAB API documentation
    // import_id format: 'YNAB:[milliunit_amount]:[iso_date]:[occurrence]'
    return `${importId}:${occurence[importId]++}`;
  };
}

async function postTransactions(
  budgetId: string,
  apiKey: string,
  transactions: YnabTransactionsRequest,
): Promise<YnabTransactionsResponse> {
  return await ky.post(
    `https://api.youneedabudget.com/v1/budgets/${budgetId}/transactions`,
    {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify(transactions),
    },
  ).json<YnabTransactionsResponse>();
}

function fromYnabTransactions(
  transactions: YnabTransaction[],
): Transaction[] {
  return transactions.map((t) => ({
    amount: t.amount / 1000,
    date: parseDate(t.date),
    description: t.memo ?? "",
    payerOrPayee: t.payee_name ?? "",
  }));
}

function formatDate(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

function parseDate(d: string): Date {
  return parse(d, "yyyy-MM-dd");
}

function toMilliAmount(amount: number): number {
  return Math.round(amount * 1000);
}

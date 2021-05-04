import { brightGreen, brightRed, format, Table, underline } from "../deps.ts";
import { AccountStatement, Summary, Transaction } from "../types.ts";

export function printAccountStatement(
  { transactions, summary }: AccountStatement,
) {
  printTransactions(transactions);
  console.log();

  printSummary(summary);
  console.log();
}

export function printTransactions(transactions: Transaction[]) {
  new Table().header([
    underline("Date"),
    "    " + underline("Amount"),
    underline("Payer/Payee"),
    underline("Description"),
  ])
    .body(transactions.map((t) => [
      formatDate(t.date),
      formatAmountWithColor(t.amount),
      t.payerOrPayee,
      t.description,
    ]))
    .padding(2)
    .render();
}

export function printSummary(summary: Summary) {
  console.log(underline("Summary"));

  const balance = summary.availableAmount + summary.reservedAmount;
  console.log("Balance:   " + (balance).toFixed(2).padStart(8));
  console.log("Reserved:  " + summary.reservedAmount.toFixed(2).padStart(8));
  console.log("Available: " + summary.availableAmount.toFixed(2).padStart(8));
}

function formatAmountWithColor(amount: number) {
  const color = amount > 0 ? brightGreen : brightRed;
  return color(amount.toFixed(2).padStart(10));
}

function formatDate(date: Date) {
  return format(date, "yyyy-MM-dd");
}

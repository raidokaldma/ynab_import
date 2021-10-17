// deno run --unstable --allow-all ynab_import.ts
import { AccountStatement, BankName, Transaction } from "./types.ts";
import { sendTransactionsToYnab } from "./ynab/ynab.ts";
import {
  printAccountStatement,
  printTransactions,
} from "./util/print_transactions.ts";
import * as swedbank from "./swedbank/swedbank.ts";
import * as revolut from "./revolut/revolut.ts";
import * as demo from "./demo/demo.ts";
import { readArgsOrExit } from "./util/args_parser.ts";
import { Config, readConfigOrExit } from "./util/config_parser.ts";

const bankName: BankName = readArgsOrExit();
const config: Config = await readConfigOrExit();

type BankConfig = {
  fetch: () => Promise<AccountStatement>;
  ynabAccountId?: string;
};

const bankConfigurations: Record<BankName, BankConfig> = {
  swedbank: ({
    fetch: () =>
      swedbank.fetchAccountStatement(
        config.swedbank.userId,
        config.swedbank.socialSecurityId,
      ),
    ynabAccountId: config.ynab.accountIds.swedbank,
  }),
  revolut: ({
    fetch: () =>
      revolut.fetchAccountStatement(
        config.revolut.phoneNumber,
        config.revolut.password,
      ),
    ynabAccountId: config.ynab.accountIds.revolut,
  }),
  demo: ({
    fetch: () => demo.fetchAccountStatement(),
  }),
};

const bankConfig: BankConfig = bankConfigurations[bankName];

const accountStatement = await bankConfig.fetch();
printAccountStatement(accountStatement);

const ynabAccountId = bankConfig.ynabAccountId;
if (!ynabAccountId) {
  console.log("❗️ Skipping YNAB import, account ID not specified.");
  Deno.exit();
}

const importedTransactions: Transaction[] = await sendTransactionsToYnab(
  accountStatement.transactions,
  {
    budgetId: config.ynab.budgetId,
    accountId: ynabAccountId,
    apiKey: config.ynab.apiKey,
  },
);

if (importedTransactions.length > 0) {
  console.log("Imported transactions:");
  printTransactions(importedTransactions);
} else {
  console.log("✅ YNAB is up to date");
}

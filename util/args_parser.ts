import { BankName, bankNames } from "../types.ts";

export function readArgsOrExit(): BankName {
  if (Deno.args.length === 1 && isValidBankName(Deno.args[0])) {
    return Deno.args[0];
  }

  console.log("Usage: ynab_import " + bankNames.join("|"));
  Deno.exit(1);
}

function isValidBankName(bankName: string): bankName is BankName {
  return (bankNames as ReadonlyArray<string>).includes(bankName);
}

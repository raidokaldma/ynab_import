export const bankNames = ["swedbank", "revolut", "demo"] as const;
export type BankName = typeof bankNames[number];

export interface Transaction {
  date: Date;
  amount: number;
  payerOrPayee: string;
  description: string;
}

export interface Summary {
  reservedAmount: number;
  availableAmount: number;
}

export interface AccountStatement {
  transactions: Transaction[];
  summary: Summary;
}

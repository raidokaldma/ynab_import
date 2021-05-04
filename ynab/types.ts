export interface YnabTransactionsRequest {
  "transactions": YnabTransaction[];
}

export interface YnabTransactionsResponse {
  data: {
    "transactions_ids": string[];
    "duplicate_import_ids": string[];
    "transactions": YnabTransaction[];
    // ...
  };
}

export interface YnabTransaction {
  "account_id": string;
  "date": string; // ISO date
  "amount": number; // milliunits format (amount * 1000)
  "payee_id"?: string;
  "payee_name"?: string; // max length 50
  "category_id"?: string;
  "memo"?: string; // max length 200
  "cleared"?: "cleared" | "uncleared" | "reconciled";
  "approved"?: boolean;
  "flag_color"?: "red" | "orange" | "yellow" | "green" | "blue" | "purple";
  "import_id"?: string; // Uses format: 'YNAB:[milliunit_amount]:[iso_date]:[occurrence]'.
  // ...
}

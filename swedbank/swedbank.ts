import { Browser, Page, parse, puppeteer } from "../deps.ts";
import { AccountStatement, Summary, Transaction } from "../types.ts";
import { logProgress, stopProgress } from "../util/log_progress.ts";

/** 
 * Fetches account statement from Swedbank,
 * uses biometrics on the phone for authentication
 **/
export async function fetchAccountStatement(
  userId: string,
  socialSecurityId: string,
): Promise<AccountStatement> {
  const browser = await puppeteer.launch({ headless: true });

  try {
    logProgress("Opening landing page");
    const page = await openLandingPage(browser);
    await acceptCookies(page);

    logProgress("Confirm log in on your phone, waiting...");
    await logInWithBiometricId(page, userId, socialSecurityId);

    logProgress("Fetching account overview page");
    const summary = await fetchAccountOverview(page);

    logProgress("Fetching transactions");
    const transactions = await fetchTransactions(page);

    return { summary, transactions };
  } finally {
    stopProgress();
    await browser.close();
  }
}

async function openLandingPage(browser: Browser): Promise<Page> {
  const page = await browser.newPage();
  await page.goto("https://www.swedbank.ee/private");
  return page;
}

async function acceptCookies(page: Page) {
  await page.click("#cookie-consent .ui-cookie-consent__accept-all-button");

  // Wait for modal to disappear
  await page.waitForSelector("#cookie-consent .ui-modal__window", {
    hidden: true,
  });
}

async function logInWithBiometricId(
  page: Page,
  userId: string,
  identityNumber: string,
): Promise<void> {
  await page.click("#SIMPLE_ID-control");
  await page.type("#SIMPLE_ID input[name='userId']", userId);
  await page.type("#SIMPLE_ID input[name='identityNumber']", identityNumber);
  await page.click("#SIMPLE_ID button[type='submit']");

  // Wait until logged in
  await page.waitForSelector("#last-login-container");
}

async function fetchTransactions(page: Page): Promise<Transaction[]> {
  await page.click('a[data-wt-label="QL_Account_statement"]');
  page.waitForSelector("#account-statement-form");
  const link = await page.waitForSelector(".period-list li:last-of-type a");
  await link?.click();
  // await page.click(".period-list li:last-of-type a"); // Pick last predefined filter: Last month + current month

  await page.waitForSelector("#tblStatement");

  type TableRowData = {
    date: string;
    payerOrPayee: string;
    description: string;
    amount: string;
  };

  const rows: TableRowData[] = await page.$$eval<TableRowData[]>(
    "#tblStatement tbody tr",
    (tableRows) => {
      return tableRows.filter((tr) => tr.id.startsWith("t_0")).map((tr) => {
        const tdElements = tr.querySelectorAll("td");

        return {
          date: tdElements[1].innerText,
          payerOrPayee: tdElements[2].innerText,
          description: tdElements[3].innerText
            // 123456******1234 01.04.21 APPLE.COM/BILL ITUNES.COM -> 01.04.21 APPLE.COM/BILL ITUNES.COM
            .replace(/^\d{6}\*+\d{4}\s+/, ""),
          amount: tdElements[4].innerText,
        };
      });
    },
  ) as unknown as TableRowData[];

  return rows.map((tableRowData) => ({
    date: parseDate(tableRowData.date),
    amount: parseNumber(tableRowData.amount),
    payerOrPayee: tableRowData.payerOrPayee || "Swedbank",
    description: tableRowData.description,
  }));
}

async function fetchAccountOverview(page: Page): Promise<Summary> {
  // Wait until logged in and account balance is visible
  await page.waitForSelector("#accounts-balance tbody tr");

  // Takes amounts from 1st account
  const summary = await page.$eval<Summary>(
    "#accounts-balance tbody tr",
    (firstTr): Summary => {
      const reservedAmount = firstTr.querySelector('td[data-th="Broneeritud"]')
        .innerText;

      const availableAmount = firstTr.querySelector('td[data-th="Vaba jääk"]')
        .innerText
        .replace(/\s+/, "") // 1 234.56EUR -> 1234.56EUR
        .replace("EUR", ""); // 1234.56EUR -> 1234.56

      return {
        reservedAmount: Number(reservedAmount),
        availableAmount: Number(availableAmount),
      };
    },
  );

  return summary as unknown as Summary;
}

function parseNumber(numberAsString: string): number {
  return parseFloat(numberAsString.trim().replace(/[\s]+/, ""));
}

function parseDate(dateAsString: string): Date {
  return parse(dateAsString, "dd.MM.yyyy");
}

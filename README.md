# YNAB Importer

Tool for myself for importing bank transactions to YNAB
https://www.youneedabudget.com/

Supported banks:

- https://www.swedbank.ee/
- https://www.revolut.com/

# Example:

```bash
$ ynab_import revolut
Date            Amount  Payer/Payee                       Description
2021-05-01       15.00  Some Guy                          Lunch
2021-05-02     -105.85  Paypal Vendor X, 35314369001, FR  Paypal *vendorx

Summary
Balance:     394.85
Reserved:     30.06
Available:   364.79

Imported transactions:
Date            Amount  Payer/Payee                       Description
2021-05-02     -105.85  Paypal Vendor X, 35314369001, FR  Paypal *vendorx
```

## Prerequisites

- `deno` - https://deno.land/

## Installing

```bash
$ git clone https://github.com/raidokaldma/ynab_import.git
$ cd ynab_import
$ cp config.json.example config.json
$ deno install --unstable --allow-all ynab_import.ts
```

## Running

```bash
$ ynab_import # displays usage
$ ynab_import demo
$ ynab_import revolut
$ ynab_import swedbank
```

## Troubleshooting

> error: Uncaught (in promise) Error: Could not find browser revision 869685.
> Run "PUPPETEER_PRODUCT=chrome deno run -A --unstable
> https://deno.land/x/puppeteer@9.0.0/install.ts" to download a supported
> browser binary.

Follow instructions above or make sure you have environment variable
`PUPPETEER_EXECUTABLE_PATH` set and pointing to correct path of
Chrome/Chromium/Brave

### Apple M1

Make sure you have Chrome installed for "Mac with Apple chip"

```bash
export PUPPETEER_EXECUTABLE_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
```

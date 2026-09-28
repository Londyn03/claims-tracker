# Claims Tracker

Claims Tracker is a lightweight, responsive web app for organizing sample insurance claims. Add fictional patient and claim details, review claims by status, and see claim counts and dollar totals at a glance.

The app is built with plain HTML, CSS, and JavaScript. It requires no framework, package installation, backend, or build step.

## Features

- Add claims with a claim ID, fictional patient name, insurance payer, amount, and status.
- View claims in a table and filter by All, Open, Denied, or Paid.
- See the total amount and claim count for all claims and for each status.
- Change a claim's status or delete it from its row.
- Keep claims between visits using the browser's `localStorage`.
- Use the responsive interface on desktop and mobile screens.

## Getting started

### Requirements

A modern web browser with JavaScript enabled. No additional dependencies are required.

### Install and run

1. Download or clone this project.
2. Open `index.html` in a web browser.

The app can also be served from the project directory with any static file server. For example, if Python is installed:

```sh
python -m http.server 8000
```

Then visit [http://localhost:8000](http://localhost:8000) in your browser.

## Usage

1. In **Add a claim**, enter a claim ID, a fictional patient name, the insurance payer, and a non-negative amount. Choose **Open**, **Denied**, or **Paid**; all fields are required.
2. Select **Add claim**. The new claim appears in the table and is saved in the browser.
3. Use **All**, **Open**, **Denied**, and **Paid** above the table to filter the visible rows.
4. Review the summary cards for the total amount and number of claims in each status.
5. Use the status dropdown in a row to update a claim, or select **Delete** to remove it. Changes are saved automatically.

## Data and privacy

Claims are stored in `localStorage` in the browser where the app is running. They are not sent to a server and are not shared between browsers or devices. Clearing the browser's site data removes saved claims.

Use fictional sample data only. This app is a basic local tracker and is not intended for real patient information or as a secure claims-management system.

## Project files

- `index.html` — Page structure and claim form.
- `styles.css` — Responsive layout and visual styling.
- `script.js` — Claim creation, filtering, summaries, status updates, deletion, and local storage.

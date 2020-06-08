# Newtelco MaintenanceDB

🚀 Rewrite of [maintenance.newtelco.de](https://maintenance.newtelco.de) with a modern stack.

## Features

- Gmail API - Create maintenance entries directly from incoming Emails
- Google Translate API - Translate mails directly in the read preview
- Google Calendar API - Create calendar entries from the application
- Clean, professional, responsive UI
- WYSIWYG Editor
- Export data to CSV
- LogRocket error tracking
- Keyboard Shortcuts

## Stack

- Next.js / React
- RSuite UI Library
- MySQL
- Ag-Grid
- Algolia Search

## Contributing

There is an API sister project to this one located in the following repo: (`ndom91/api-maintenance`). This must be running during dev / prod to get anything going.

#### Prerequisites:
1. MySQL DB
2. G Suite Service Account .json credential file
3. SMTP Server

#### Frontend

1. `git clone https://github.com/ndom91/next-maintenance`
2. `cd next-maintenance && npm i`
3. `npm run dev`

This will then start the frontend on port `4000`

#### Backend

1. `git clone https://github.com/ndom91/api-maintenance`
2. `cd api-maintenance && npm i`
3. `npm run dev`

This will then start the backend on port `4100`

It is currently setup so that the host is dynamic, you can reverse proxy it out under any domain, however it is important that wherever you reverse proxy out the frontend, the backend must be under the subdomain `api` of the same domain. So, for example, if you have the frontend available at `myapplication.com`, then the backend must be available at `api.myapplication.com`. 


### Screenshots

<img src="https://i.imgur.com/UJdRJs4.png" width="512" alt="screenshot 1">

<img src="https://i.imgur.com/2RFzi0Q.png" width="512" alt="screenshot 2">

<img src="https://i.imgur.com/S0huKm2.png" width="512" alt="screenshot 3">

**Internal Application used by NewTelco GmbH**

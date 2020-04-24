# Newtelco MaintenanceDB

🚀 Rewrite of [maintenance.newtelco.de](https://maintenance.newtelco.de) with a modern stack.

## Features

- Gmail API - Create maintenance entries directly from incoming Emails
- Google Translate API - Translate mails directly in the read preview
- Google Calendar API - Create calendar entries from the application
- Clean, professional, responsive UI
- WYSIWYG Editor
- Export history data to CSV
- LogRocket error tracking
- Keyboard Shortcuts
- Darkmode 
- SMTP Outbound Mail

## Technology

- Next.js / React
- Custom Next.js Server (Express)
- RSuite UI Library
- MySQL
- Passport Auth
- Ag-Grid
- Algolia Search

## Contributing

There is an API part to this project contained in a sister repo (`ndom91/api-maintenance`) which must be running as well. 

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

<img src="https://imgur.com/0TCYfJE.png" width="512" alt="screenshot 1">

<img src="https://imgur.com/x1UW9Ox.png" width="512" alt="screenshot 2">

<img src="https://imgur.com/SK2DOuD.png" width="512" alt="screenshot 3">

<img src="https://imgur.com/3QymwYQ.png" width="512" alt="screenshot 4">

<img src="https://imgur.com/wz4LOzy.png" width="512" alt="screenshot 5">

**Internal Application used by NewTelco GmbH**

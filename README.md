<img align="right" src="https://imgur.com/HPVFsC4.png" height="256" />

# Network MaintenanceDB

🚀 [maintenance.newtelco.de](https://maintenance.newtelco.de) with a modern stack.

> Manage, update and notify your customers of maintenance windows and more! 🚧

## Features

- Gmail API - Create maintenance entries directly from incoming emails
- Google Translate API - Translate mails directly in the read preview
- Google Calendar API - Create calendar entries from the application
- Clean, professional, responsive UI
- WYSIWYG Editor
- Export data to CSV
- Sentry + LogRocket
- Keyboard Shortcuts

## Contributing

There is an API sister project to this one located in the following repo: (`newtelco/api-maintenance`). This must be running during dev / prod to get anything going.

#### Prerequisites:

1. MySQL DB
2. Google Workspace Service Account .json credential file
3. SMTP Server

#### Frontend

1. `git clone https://github.com/newtelco/next-maintenance`
2. `cd next-maintenance && npm i`
3. `npm run dev`

This will then start the frontend on port `4000`

#### Backend

1. `git clone https://github.com/newtelco/api-maintenance`
2. `cd api-maintenance && npm i`
3. `npm run dev`

This will then start the backend on port `4100`

It is currently setup so that the host is dynamic, you can reverse proxy it out under any domain, however it is important that wherever you reverse proxy out the frontend, the backend must be available under the same domain, under the path prefix `/v1/api/..`. So, for example, if you have the frontend available at `myapplication.com`, then the backend must be available at `myapplication.com/v1/api`.

An example nginx config file is included in the [api repository](https://github.com/newtelco/api-maintenance).

### Screenshots

<img src="https://i.imgur.com/UJdRJs4.png" width="512" alt="screenshot 1">

<img src="https://i.imgur.com/2RFzi0Q.png" width="512" alt="screenshot 2">

<img src="https://i.imgur.com/S0huKm2.png" width="512" alt="screenshot 3">

**Internal Application used by NewTelco GmbH**

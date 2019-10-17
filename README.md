# Newtelco MaintenanceDB

🚀 Rewrite of [maintenance.newtelco.de](https://maintenance.newtelco.de) with a modern stack.

## Features

- Gmail API - Create maintenance entries directly from Emails as well as send mails directly to clients to inform them
- Google Translate API - Translate Russian mails directly in the read preview
- Google Calendar API - Create calendar entries at the click of a button
- Export history data to CSV
- LogRocket + Sentry Error Logging
- Blazing fast SPA built on:  
  - Next.js / React
  - Custom Next.js Server (Express)
  - ShardsUI (Bootstrap 4 spin-off)
  - MongoDB backend for auth 
  - MySQL backend for data
  - Nedb
  - Passport
  - Ag-Grid

## Setup

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

![screenshot 1](https://imgur.com/NN1F2OM.png)

![screenshot 2](https://imgur.com/5ZNu8Ao.png)

![screenshot 3](https://imgur.com/v1E8xo1.png)


**Internal Application used by NewTelco GmbH**

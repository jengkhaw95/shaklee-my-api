# Disclaimer

This project is not affiliated, associated, authorized, endorsed by, or in any way officially connected with Shaklee Products (Malaysia) Sdn. Bhd. or Shaklee Corporation.

Data return from API endpoint in this project can be publicly obtained in [official website](https://www.shaklee.com.my/). However, they are the property of Shaklee Products (Malaysia) Sdn. Bhd. or Shaklee Corporation.

## This project is under maintenance

Previously this project is powered by `ExpressJS` as a stateful server hosted in Railway.

It is now under a migration progress to serving RESTful API with serverless function hosted on [Vercel](https://vercel.com/).

### Migration Progress

- [x] Convert all `cron jobs` into `Queue` which is supported by `Upstash`'s `Qstash` feature.
- [ ] Convert Telegram webhook API endpoint for serverless function
- [ ] RESTful API for `products` & `banners`

## Introduction

This is a `typescript` project to:

1. Serve Shaklee Malaysia `products` & `banners` data via RESTful API.
2. Host an intaractive `Telegram` bot to communicate with users using the data served by the RESTful API.

## Tech Stack

- Hosting - `Vercel`
- Database - `MongoDB`
- Queue/Cron - `Upstash/Qstash`
- Telegram API - `Telegram official HTTP API`

<!--## Introduction

This projects uses `ExpressJS` as a backend server to serve RESTful API for Shaklee Malaysia products.

This project serves `products` & `banners` using serverless function.

## Demo

~~This project is hosted on Heroku.~~

~~his project is migrated to Railway.~~

This project is now hosted on [Vercel](https://vercel.com/)

## What is this?

This is a project built on top of the Shaklee Malaysia products. Core features:

### RESTful API

An ExpressJS powered backend to serve data such as `products` & `announcements`. [View API Docs](https://shaklee-my-api.up.railway.app/)

### Cron worker

Workers are scheduled to keep the data synced with the Official Website.

### Telegram Bot

A [telegram bot](https://t.me/ShakleeMYBot) that serves as a Q&A interface for user to interact with the data.

## Tech stack

- Server - `ExpressJS`
- Database - `MongoDB`
- Telegram API - `Telegram official API`-->

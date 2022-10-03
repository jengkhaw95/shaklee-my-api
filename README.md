# Disclaimer

This project is not affiliated, associated, authorized, endorsed by, or in any way officially connected with Shaklee Products (Malaysia) Sdn. Bhd. or Shaklee Corporation.

Data return from API endpoint in this project can be publicly obtained in [official website](https://www.shaklee.com.my/). However, they are the property of Shaklee Products (Malaysia) Sdn. Bhd. or Shaklee Corporation.

## Introduction

This projects uses `ExpressJS` as a backend server to serve RESTful API for Shaklee Malaysia products.

## Demo

~~This project is hosted on Heroku.~~

This project is migrated to [Railway](https://railway.app/).

## What is this?

This is a project built on top of the Shaklee Malaysia products. Core features:

1. RESTful API

An ExpressJS powered backend to serve data such as `products` & `announcements`. [View API Docs](https://shaklee-my-api.up.railway.app/)

2. Cron worker

Workers are scheduled to keep the data synced with the Official Website.

3. Telegram Bot

A [telegram bot](https://t.me/ShakleeMYBot) that serves as a user-friendly interface for user to interacte with the data.

## Tech stack

- Server - `ExpressJS`
- Database - `MongoDB`
- Telegram API - `Telegram official API`

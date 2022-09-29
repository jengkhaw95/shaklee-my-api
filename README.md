# Disclaimer

This project is not affiliated, associated, authorized, endorsed by, or in any way officially connected with Shaklee Products (Malaysia) Sdn. Bhd. or Shaklee Corporation.

Data return from API endpoint in this project can be publicly obtained in [official website](https://www.shaklee.com.my/). However, they are the property of Shaklee Products (Malaysia) Sdn. Bhd. or Shaklee Corporation.

## Introduction

This projects uses `Express` as a backend server to serve RESTful API for Shaklee Malaysia products.

## Demo

~~This project is hosted on Heroku.~~

This project is migrated to [Railway](https://railway.app/). [View Demo](https://shaklee-my-api.up.railway.app/)

## How it works

As this project is non-official, all the data are acquired from Shaklee Malaysia website.

The project contains 2 parts:

### Server

The server is used to host the API endpoints. (possibly docs in future)

### Worker

The worker is used to retrieve latest data externally in a reasonable interval of time.
All the data are then stored in database (`Mongodb`).

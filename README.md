# Intent Service (backend)

Backend service for intent capturing.

Part of Jane's capabilities.


## PostgreSQL Startup Script

Can be found here [gist.github.com](https://gist.github.com/ballgoesvroomvroom/47db0c9e9d3a064873367ac43d62b6c2)

# Deploy
Service is meant to be hosted locally, within same network as [Jane](https://github.com/scalereach/jane)

Ensure .env file is within `src` folder (e.g. `/src/.env`)

1. `docker build -t intent-service .`
2. `docker run -p 5732:5732 --env-file src/.env intent-service`
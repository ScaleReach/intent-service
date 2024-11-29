const express = require("express");
const http = require("http");
const path = require("path")
const fs = require("fs")
const cookieParser = require("cookie-parser")
const bparser = require("body-parser")
const multer = require("multer")
const dotenv = require("dotenv").config({ path: __dirname + "/.env" })

const config = require("./config")
const header = require("./header")

const auth_router = require(path.join(__dirname, "./routers/auth.js"));
const intent_router = require(path.join(__dirname, "./routers/intent.js"));

const sessionService = require(path.join(__dirname, "./includes/session"))

const upload = multer() // text fields only

const app = express();
const server = http.createServer(options, app);
const PORT = process.env.PORT;

// cors allow interface to request
app.use((req, res, next) => {
	res.setHeader("Access-Control-Allow-Origin", config.interface.url) // allow interface
	res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
	res.setHeader("Access-Control-Allow-Headers", `Content-Type, Authorization, ${config.interface.authKeyHeaderField}`)
	next();
})

// attach session object to all the calls
app.use(cookieParser()) // parse cookies
app.use((req, res, next) => {
	let sessionId = req.cookies[config.sessioncookiename]
	if (sessionId && sessionService.SessionStore.has(sessionId)) {
		let session = sessionService.SessionStore.get(sessionId)

		req.session = session // attach it to request object so future endpoints can reference
		return next() // already has session
	}

	// need to generate new session
	req.session = new sessionService.SessionClient()
	
	// include set-cookie in response headers
	res.setHeader("Set-Cookie", `${config.sessioncookiename}=${req.session.get_id()}; Path=/; HttpOnly; SameSite=Strict`)
	return next()
})

app.use(upload.none())
app.use(bparser.text()) // raw text
app.use(bparser.urlencoded({ extended: true })) // form-data
app.use(auth_router.baseURL, auth_router.router)
app.use(intent_router.baseURL, intent_router.router)

console.log("Allowing CORS", config.interface.url)

server.listen(PORT, (error) => {
	if (!error) {
		console.log("Server is Successfully Running, and App is listening on port "+ PORT)
		console.log(header("Intent service", PORT))
	} else {
		console.log("Error occurred, server can't start", error);
	}
});
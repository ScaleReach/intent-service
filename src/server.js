const express = require("express")
const { Server } = require("socket.io")
const http = require("http")
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

const intentService = require(path.join(__dirname, "./includes/intent"))
const sessionService = require(path.join(__dirname, "./includes/session"))

const upload = multer() // text fields only

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
	cors: {
		origin: [config.dashboard.url],
		methods: ["GET"],
		credentials: false
	}
})
const PORT = process.env.PORT;

// socket server
io.on("connection", async (socket) => {
	console.log("regular route connected")

	// fetch top n latest requests, use cached
	const data = await intentService.getLatestIntent()
	if (data.success) {
		io.sockets.emit("data", data.data)
	} else {
		io.sockets.emit("error", data.message)
	}
})

const serverHandler = async (intentData) => {
	/**
	 * fired when new intents are being created
	 */
	const data = await intentService.getLatestIntent()
	if (data.success) {
		io.sockets.emit("data", data.data)
	} else {
		io.sockets.emit("error", data.errorMessage)
	}
}
intentService.server.handler = serverHandler // set reference

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

server.listen(PORT, (error) => {
	if (!error) {
		console.log("Server is Successfully Running, and App is listening on port "+ PORT)
		console.log(header("Intent service", PORT))
	} else {
		console.log("Error occurred, server can't start", error);
	}
});
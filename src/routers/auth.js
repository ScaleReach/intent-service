const baseURL = "/auth"

const express = require("express")
const path = require("path")
const config = require(path.join(__dirname, "../config"))

// router object
const router = express.Router()

// router.get("/authenticate", (req, res) => {
// 	let session = new sessionService.SessionClient()

// 	return res.json({
// 		"key": session.get_id()
// 	})
// })

router.post("/establish", (req, res) => {
	/**
	 * establish connection from Jane server
	 * authorise future actions
	 */
	let headers = req.headers
	if (headers[config.interface.authKeyHeaderField]) {
		let authKey = headers[config.interface.authKeyHeaderField].trim()
		if (authKey !== process.env.SECRET_KEY) {
			console.log("not equals", authKey, process.env.SECRET_KEY)
			return res.status(400).end() // invalid credentials
		}

		// create new session
		let session = req.session // sure have due to middleware before this route that sets the session object + cookie header
		session._priv = 1 // upgrade privilege

		// return success payload
		return res.json({
			"success": true
		})
	}

	return res.status(400).end()
})

const isJaneMiddleware = (req, res, next) => {
	/**
	 * should have session already attached
	 */
	let session = req.session
	if (!session) {
		return res.status(400).end()
	}

	let authKey = req.headers[config.interface.authKeyHeaderField]
	console.log("authKey", authKey)
	if (!authKey) {
		// no auth key supplied
		return res.status(400).end()
	}

	console.log("session", session._priv, process.env.SECRET_KEY)
	if (session._priv === 1 && authKey === process.env.SECRET_KEY) {
		return next()
	}
	return res.status(400).end()
}

module.exports = { // export router object and authenticated middleware
	baseURL, router, isJaneMiddleware
}
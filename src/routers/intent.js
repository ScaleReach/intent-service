const baseURL = "/intent"

const express = require("express")
const path = require("path")
const config = require(path.join(__dirname, "../config"))
const intentService = require(path.join(__dirname, "../includes/intent"))
const sessionService = require(path.join(__dirname, "../includes/session"))

const authRouter = require(path.join(__dirname, "./auth"))
const database = require(path.join(__dirname, "../includes/sqlClient"))

// router object
const router = express.Router()

router.post("/new", authRouter.isJaneMiddleware, async (req, res) => {
	/**
	 * add a new intent
	 * 
	 * req.body: FormData
	 */
	const formData = req.body // parsed by body-parse module
	console.log("formData", formData)
	const validatedFields = intentService.CreateIntentSchema.safeParse({
		userid: formData.userid,
		type: formData.type,
		status: formData.status,
		description: formData.description,
	})

	if (!validatedFields.success) {
		console.log("errors", validatedFields.error.flatten().fieldErrors)
		return res.status(400).json({
			errors: validatedFields.error.flatten().fieldErrors,
		})
	}

	const fieldData = validatedFields.data
	const payload = await intentService.createIntent(fieldData.userid, fieldData.type, fieldData.status, fieldData.description)
	console.log("payload", payload)
	if (!payload.success) {
		return res.status(400).json({
			errorMessage: payload.errorMessage
		})
	}

	return res.json({
		id: payload.id
	})
})

router.get("/users", async (req, res) => {
	let data = await database.getUserData()
	console.log("DATA", data)

	return res.json(data)
})

module.exports = { // export router object and authenticated middleware
	baseURL, router
}
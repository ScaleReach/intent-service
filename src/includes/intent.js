/**
 * service to handle intent related actions
 */
const path = require("path")
const database = require(path.join(__dirname, "./sqlClient"))
const { z } = require("zod")

const CreateIntentSchema = z.object({
	userid: z
		.string()
		.uuid(),
	type: z
		.coerce.number()
		.gte(0) // accommodate for 0 for uncategorised type (categories serial begin from 1)
		.lte(4),
	description: z
		.string()
		.trim()
		.min(3)
		.max(2500)
})

async function createIntent(userid, type, description) {
	/**
	 * userid: string,
	 * type: number,
	 * description: string,
	 * 
	 * creates a new entry in the intent record, assumes input has been sanity-checked
	 * 
	 */
	try {
		console.log("creating")
		let id = await database.insertIntent({
			userid, type, description
		})

		return {
			success: true,
			id
		}
	} catch (err) {
		return {
			success: false,
			errorMessage: err.message ?? "Failed to insert into database: unspecified"
		}
	}
}

module.exports = {
	CreateIntentSchema, createIntent
}
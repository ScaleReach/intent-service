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

const _cache = {
	map: new Map(),
	order: [],
	etag: 0,
}

const socketServer = {
	handler: undefined // will be set
}

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
		let intentData = await database.insertIntent({
			userid, type, description
		})
		_cache.etag++; // expire current cache

		// update connected clients
		if (socketServer.handler) {
			socketServer.handler(intentData)
		}

		return {
			success: true,
			id: intentData.id
		}
	} catch (err) {
		return {
			success: false,
			errorMessage: err.message ?? "Failed to insert into database: unspecified"
		}
	}
}

async function getLatestIntent() {
	/**
	 * returns cached intentData[]
	 */
	try {
		console.log("creating")
		let cachedData = await database.getLatestIntent(10)

		// set cache
		_cache.map.clear() // clear cache
		_cache.order.splice(0, _cache.order.length) // clear cache order
		_cache.etag = 0 // reset etag value to determine cache expiry
		for (let intent of cachedData) {
			_cache.map.set(intent.id, intent)
			_cache.order.push(intent.id)
		}

		return {
			success: true,
			data: cachedData
		}
	} catch (err) {
		return {
			success: false,
			errorMessage: err.message ?? "Failed to insert into database: unspecified"
		}
	}
}

module.exports = {
	CreateIntentSchema, createIntent, server: socketServer
}
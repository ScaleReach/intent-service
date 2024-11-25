const path = require("path")
const pg = require("pg")
const config = require(path.join(__dirname, "../config"))

class SQLError extends Error {
	constructor(msg) {
		super(msg)
	}
}

const pool = new pg.Pool({
	host: config.PSQL.HOST,
	port: config.PSQL.PORT,
	user: config.PSQL.UNAME,
	password: process.env.PSQL_PASSWORD,
	database: config.PSQL.DB_NAME,
})

async function getIntentData(intentId) {
	/**
	 * queries for the intent
	 * 
	 * returns the intentData
	 * returns undefined if no intentData returned from query
	 */
	try {
		let intentDataRow = await pool.query(`SELECT * FROM "intent" WHERE id = $1`, [id])
		if (intentDataRow.rows.length !== 1) {
			// no results or more than one result
			return
		}

		return intentDataRow.rows[0]
	} catch (err) {
		throw new SQLError(`Failed to query from "intent": ${err.message}`)
	}
}

async function insertIntent(intentData) {
	/**
	 * userid: string,
	 * type: number,
	 * description: string
	 * 
	 * returns id of newly created intent if successfully
	 * otherwise throws an error
	 */
	try {
		let intentDataRow = await pool.query(
			`INSERT INTO "intent" (userid, type, description)
				VALUES ($1, $2, $3)
				RETURNING id`,
			[intentData.userid, intentData.type, intentData.description]
		)

		if (intentDataRow.rows.length !== 1) {
			throw new Error(`Either 0 or more than 1 rows returned: ${JSON.stringify(intentDataRow.rows)}`)
		}
		return intentDataRow.rows[0].id
	} catch (err) {
		throw new SQLError(`Failed to insert into "intent": ${err.message}`)
	}
}

module.exports = {
	getIntentData, insertIntent
}
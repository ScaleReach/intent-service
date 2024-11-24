let development = {
	sessioncookiename: "whatami",

	interface: {
		url: "http://localhost:3000", // url for jane
		authKeyHeaderField: "x-intent-key"
	},

	PSQL: {
		HOST: "54.169.176.185",
		PORT: 5432,
		UNAME: "postgres",
		DB_NAME: "intent"
	}
}

let production = {
	sessioncookiename: "whatami",

	interface: {
		url: "http://localhost:3000", // url for jane
		authKeyHeaderField: "x-intent-key"
	},

	PSQL: {
		HOST: "54.169.176.185",
		PORT: 5432,
		UNAME: "postgres",
		DB_NAME: "intent"
	}
}

module.exports = process.env.NODE_ENV === "production" ? production : development
let development = {
	sessioncookiename: "whatami",

	jane: {
		authKeyHeaderField: "x-intent-key"
	},

	dashboard: {
		url: "http://localhost:3004"
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

	jane: {
		authKeyHeaderField: "x-intent-key"
	},

	dashboard: {
		url: "https://dashboard.scalereach.team"
	},

	PSQL: {
		HOST: "54.169.176.185",
		PORT: 5432,
		UNAME: "postgres",
		DB_NAME: "intent"
	}
}

module.exports = process.env.NODE_ENV === "production" ? production : development
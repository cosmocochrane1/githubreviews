var env = process.env.NODE_ENV;
console.log(`env = ${env}`);

var config = require('./config.json');

// If its defined in config.js...
if (config[env]) {
	var envConfig = config[env];
	Object.keys(envConfig).forEach((key) => {
		process.env[key] = envConfig[key];
	});
	//loops through the JSON object and assigns the respective values
	
} else {
	throw `Invalid or missing NODE_ENV = '${env}'!`;
}


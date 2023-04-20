const mongoose = require('mongoose');

const processesSchema = new mongoose.Schema({
	process: {
		type: String
	}
})

module.exports = mongoose.model('Processes', processesSchema);
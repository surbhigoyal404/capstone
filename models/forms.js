const mongoose = require('mongoose');

const formsSchema = new mongoose.Schema({
	form: {
		type: String
	}
})

module.exports = mongoose.model('Forms', formsSchema);
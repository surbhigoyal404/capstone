const mongoose = require('mongoose');

const unitsSchema = new mongoose.Schema({
	unit: {
		type: String
	}
})

module.exports = mongoose.model('Units', unitsSchema);
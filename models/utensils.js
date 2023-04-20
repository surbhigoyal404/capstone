const mongoose = require('mongoose');

const utensilsSchema = new mongoose.Schema({
	utensil: {
		type: String
	}
})

module.exports = mongoose.model('Utensils', utensilsSchema);
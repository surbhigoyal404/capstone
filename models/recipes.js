const mongoose = require('mongoose');

const recipesSchema = new mongoose.Schema({
	title: {
		type: String,
		required: [true, 'Title cannot be blank!']
	},
	serves: Number,
	timecount: Number,
	timeunit: String,
	ingredient_phrases: [{ 
		count: Number, 
		unit: String, 
		ingredient: String, 
		form: String 
	}],
	instructions: [{
		description: String
	}]
})

module.exports = mongoose.model('recipes', recipesSchema);
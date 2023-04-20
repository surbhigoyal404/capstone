const express = require('express')
const path = require('path')
const bodyParser = require('body-parser');
const cheerio = require('cheerio');

const mongoose = require('mongoose')
const alert = require('alert')
const app = express()
const port = 3024



app.use( express.static( "public" ) );
app.use(express.json());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'))
app.use(bodyParser.json())
    .use(bodyParser.urlencoded({
        extended: true
    }));

const Units = require('./models/units')
const Ingredients = require('./models/ingredients')
const Forms = require('./models/forms')
const Utensils = require('./models/utensils')
const Processes = require('./models/processes')

const Recipes = require('./models/recipes')

const uri ='mongodb://localhost:27017/sample';

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  // serverSelectionTimeoutMS: 5000,
  // autoIndex: false, // Don't build indexes
  // maxPoolSize: 10, // Maintain up to 10 socket connections
  // serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  // socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  family: 4 // Use IPv4, skip trying IPv6
}

const connectWithDB = () => {
  mongoose.connect(uri, options, (err, db) => {
    if (err) console.error(err);
    else console.log("Connected to database")
  })
}

connectWithDB()

app.get('/', (req, res) => {
  res.render('landing')
})

app.get('/addrecipe', async (req, res) => {
  try {
    const regex = new RegExp('^' + req.query.data, 'i'); // add '^' to match only the beginning
    const units = await Units.find().lean();
    const ingredients = await Ingredients.find().lean();
    const forms = await Forms.find().lean();
    const processes = await Processes.find().lean();
    const utensils = await Utensils.find({ utensil: regex }, { 'utensil': 1 })
      .sort({ "updated_at": -1, "created_at": -1 })
      .limit(20)
      .lean();

    const utensilList = utensils.map(utensil => ({
      id: utensil._id,
      label: utensil.utensil
    }));
   

    res.render('addrecipe', { units, ingredients, forms, processes, utensils: utensilList });
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal server error");
  }
});

app.get('/get-data', async (req, res) => {
  try {
    const type = req.query.type; // get the type parameter from the URL
    const queryToSearch = req.query.data.split(" ");
    const regex = new RegExp('^' + queryToSearch[queryToSearch.length-1], 'i');
    if (type === 'utensils') {
      const utensils = await Utensils.find({ utensil: regex }, { 'utensil': 1 })
        .sort({ "updated_at": -1, "created_at": -1 })
        .limit(20)
        .lean();
      
      const utensilList = utensils.map(utensil => ({
        id: utensil._id,
        label: utensil.utensil
      }));
      
      res.json(utensilList);
    } else if (type === 'ingredients') {
      // handle ingredients request
    } else if (type === 'forms') {
      // handle forms request
    } else if (type === 'processes') {
      // handle processes request
    } else {
      res.status(400).send('Invalid request type');
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal server error");
  }
});

app.post('/submitrecipe', (req, res) => {
  console.log(req.body)
  var { title, serves, timecount, timeunit, count, unit, ingredient, form, 
   description } = req.body;

  ingredient_phrases = []
  instructions = []

  title = title.replace(/\b\w/g, l => l.toUpperCase())
  description=description.replace(/\b\w/g, l => l.toUpperCase())
  ingredient=ingredient.replace(/\b\w/g, l => l.toUpperCase())
  form=form.replace(/\b\w/g, l => l.toUpperCase())
  console.log(title)
  if(typeof unit === 'string') {
    ingredient_phrases.push({ count, unit, ingredient, form })
    instructions.push({ description })
  }
  else {
    for (let i = 0; i <unit.length; i++) {
      ingredient_phrase = { count: count[i], unit: unit[i], ingredient: ingredient[i], form: form[i] }
      ingredient_phrase.replace(/\b\w/g, l => l.toUpperCase())
      ingredient_phrases.push(ingredient_phrase)
    }

    for (let i = 0; i <description.length; i++) {
      instruction = { description: description[i]}
      instruction=instruction.replace(/\b\w/g, l => l.toUpperCase())
      instructions.push(instruction)
    }
  }

  var recipe = { title, serves, timecount, timeunit, ingredient_phrases, instructions };

  const recipeobject = new Recipes(recipe)
  recipeobject.save(function(err){ // will this callback always be called correctly?
      if(err) {
          alert("Error is saving recipe to database!")
      }
      else {
          alert("Recipe submitted successfully")
      }
  });

  res.redirect('/')
})

app.get('/displayrecipe', (req, res) => {
  res.render('displayrecipe')
})

app.get('/searchrecipes', (req, res) => {
    Recipes.find({}, function(err, recipes){
      if(err){
        console.log(err)
      }
      else{
        res.render('searchrecipes', { recipes })
      }
    })
})

app.post('/searchrecipes', (req, res) => {
  query = req.body.query
  queryregex = new RegExp(query, 'i')
  Recipes.find({ $or: [ { title: queryregex }, { 'ingredient_phrases.ingredient': queryregex }, { 'instructions.description': queryregex }] }, function(err, recipes){
      if(err){
        console.log(err)
      }
      else{
        if(recipes.length === 0){
          alert("No recipe matching given keyword found!") 
        }
        res.render('searchrecipes', { recipes })
      }
    }) 
})

app.get('/viewrecipe/:id', (req, res) => {
  Recipes.findOne({ _id: req.params.id }, function(err, recipe){
      if(err){
         alert("Error in loading recipe!");
         res.redirect('/searchrecipes');
      } else {
         res.render('displayrecipe', { recipe })
      }
    })
})

app.get('/aboutus', (req, res) => {
  res.render('about')
})

app.get('*', (req, res) => {
  res.render('error')
})

app.listen(port, () => {
  console.log(`RecipeCollector listening on port ${port}`)
})
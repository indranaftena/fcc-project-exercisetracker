const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const myURI = process.env['MONGO_URI']

app.use(cors())
app.use(express.static('public'))

app.use(bodyParser.urlencoded({ extended: false }));

// connect to MongoDB
mongoose.connect(myURI, {useNewUrlParser: true, useUnifiedTopology: true})

// create schema and model
let userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true
  },
})
let exerciseSc = new mongoose.Schema({
  userId: String,
  duration: Number,
  description: String,
  date: Date
})
let User = new mongoose.model('User', userSchema)
let Exercise = new mongoose.model('Exercise', exerciseSc)

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app
.route('/api/users')
.get((req, res) => {
  User.find()
  .then( doc => {
    res.json(doc)
  })
  .catch( err => {
    res.json({
      message: 'there is a problem when query users data',
      error: err
    })
  })
})
.post((req, res) => {
  User.findOneAndUpdate(req.body, req.body, { new: true, upsert: true })
  .select({ username: 1, _id: 1})
  .then( doc => {
    res.json(doc)
  })
  .catch( err => {
    res.json({
      error: err
    })
  })
})

app.post('/api/users/:_id/exercises', (req, res) => {
  newEx = new Exercise({
    userId: req.body._id,
    description: req.body.description,
    duration: req.body.duration,
    date: req.body.date
  })
  newEx.save()
  .then( doc => {
    res.json(doc)
  })
  .catch( err => {
    res.json({
      error: err
    })
  })
})

app.get('/api/users/:_id/logs', (req, res) => {
  res.json({
    message: 'coming soon'
  })
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})

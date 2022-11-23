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
mongoose.connect(myURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
})

// create schema and model
let userSchema = new mongoose.Schema({
  username: {
    type: String
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
      .then(doc => {
        res.json(doc)
      })
      .catch(err => {
        res.json({
          message: 'there is a problem when query users data',
          error: err
        })
      })
  })
  .post((req, res) => {
    User.findOneAndUpdate(req.body, req.body, { new: true, upsert: true })
      .select({ username: 1, _id: 1 })
      .then(doc => {
        res.json(doc)
      })
      .catch(err => {
        res.json({
          message: "there's problem when finding user",
          error: err
        })
      })
  })

app.post('/api/users/:_id/exercises', (req, res) => {
  User.findOne({ _id: req.params._id })
    .then(doc => {
      if (doc) {
        let newEx = new Exercise({
          userId: req.params._id,
          description: req.body.description,
          duration: req.body.duration,
          date: req.body.date ? req.body.date : new Date()
        })

        newEx.save()
          .then(inf => {
            res.json({
              username: doc.username,
              description: inf.description,
              duration: inf.duration,
              date: inf.date.toDateString(),
              _id: doc._id
            })
          })
          .catch(err => {
            res.json({
              error: err
            })
          })
      }
      else {
        res.json({
          message: "user can't be found"
        })
      }
    })
    .catch(err => {
      res.json({
        message: "there's problem when finding user, try again later",
        error: err
      })
    })
})

app.get('/api/users/:_id/logs', (req, res) => {
  let from = req.query.from
  let to = req.query.to
  let limit = parseInt(req.query.limit)
  let condition = { userId: req.params._id }

  if (from || to) {
    condition.date = {}
    if (from) condition.date['$gte'] = from
    if (to) condition.date['$lte'] = to
  }

  User.findOne({ _id: req.params._id })
    .then(doc => {
      if (doc) {
        Exercise.find(condition)
          .limit(limit)
          .then(data => {
            res.json({
              _id: req.params._id,
              username: doc.username,
              count: data.length,
              log: data.map(({ description, duration, date }) =>
                ({ description, duration, date: date.toDateString() }))
            })
          })
          .catch(err => {
            res.json(err)
          })
      }
      else {
        res.json({
          message: "can't find the user"
        })
      }
    })
    .catch(err => {
      res.json({
        message: "there's problem when finding the user",
        error: err
      })
    })

})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})

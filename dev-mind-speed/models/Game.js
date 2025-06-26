const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  equation: String,
  answer: Number,
  submittedAnswer: Number,
  isCorrect: Boolean,
  timeTaken: Number
}, { _id: false });

const gameSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  difficulty: {
    type: Number,
    required: true,
    min: 1,
    max: 4
  },
  timeStarted: {
    type: Date,
    default: Date.now
  },
  timeEnded: Date,
  score: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    default: 0
  },
  history: [questionSchema],
  bestScore: {
    equation: String,
    answer: Number,
    timeTaken: Number
  },
  timeLastAnswer: Date
});

module.exports = mongoose.model('Game', gameSchema);

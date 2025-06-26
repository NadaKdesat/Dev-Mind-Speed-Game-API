const { v4: uuidv4 } = require('uuid');
const Game = require('../models/Game');

function generateQuestion(difficulty) {
  const ops = ['+', '-', '*', '/'];
  const numOperands = difficulty + 1;
  const digits = difficulty;

  const numbers = Array.from({ length: numOperands }, () => {
    const max = Math.pow(10, digits);
    return Math.floor(Math.random() * max);
  });

  const operators = Array.from({ length: numOperands - 1 }, () => {
    return ops[Math.floor(Math.random() * ops.length)];
  });

  let equation = '';
  for (let i = 0; i < numbers.length; i++) {
    equation += numbers[i];
    if (i < operators.length) {
      equation += ` ${operators[i]} `;
    }
  }

  let answer;
  try {
    answer = eval(equation);
  } catch {
    answer = null;
  }

  return { equation, answer };
}

exports.startGame = async (req, res) => {
  const { name, difficulty } = req.body;
  if (!name || !difficulty || difficulty < 1 || difficulty > 4) {
    return res.status(400).json({ message: 'Invalid name or difficulty' });
  }

  const question = generateQuestion(difficulty);
  const timeStarted = Date.now();

  const game = new Game({
    name,
    difficulty,
    timeStarted,
    score: 0,
    total: 0,
    history: [
      {
        equation: question.equation,
        answer: question.answer,
        isCorrect: null,
        submittedAnswer: null,
        timeTaken: null
      }
    ]
  });

  await game.save();

  res.json({
    message: `Hello ${name}, find your submit API URL below`,
    submit_url: `/game/${game._id}/submit`,
    question: question.equation,
    time_started: new Date(timeStarted).toISOString()
  });
};

exports.submitAnswer = async (req, res) => {
  const { gameId } = req.params;
  const { answer } = req.body;

  const game = await Game.findById(gameId);
  if (!game) return res.status(404).json({ message: 'Game not found' });

  if (game.timeEnded) {
    return res.status(400).json({ message: 'Game already ended. No more submissions allowed.' });
  }

  const current = game.history[game.history.length - 1];
  const now = Date.now();
  const timeTaken = Math.floor((now - (game.timeLastAnswer || game.timeStarted)) / 1000);

  const isCorrect = Math.abs(answer - current.answer) < 0.0001;

  current.submittedAnswer = answer;
  current.isCorrect = isCorrect;
  current.timeTaken = timeTaken;

  game.total += 1;
  if (isCorrect) game.score += 1;

  const newQuestion = generateQuestion(game.difficulty);
  game.history.push({
    equation: newQuestion.equation,
    answer: newQuestion.answer,
    isCorrect: null,
    submittedAnswer: null,
    timeTaken: null
  });
  game.timeLastAnswer = now;

  await game.save();

  res.json({
    result: isCorrect ? `Good job ${game.name}, your answer is correct!` : `Sorry ${game.name}, your answer is incorrect.`,
    time_taken: timeTaken,
    next_question: {
      submit_url: `/game/${game._id}/submit`,
      question: newQuestion.equation
    },
    current_score: `${game.score}/${game.total}`
  });
};

exports.endGame = async (req, res) => {
  const { gameId } = req.params;

  const game = await Game.findById(gameId);
  if (!game) return res.status(404).json({ message: 'Game not found' });

  const totalTime = Math.floor((Date.now() - game.timeStarted) / 1000);
  const best = game.history.reduce((best, q) => {
    if (q.isCorrect && (best === null || q.timeTaken < best.timeTaken)) {
      return q;
    }
    return best;
  }, null);

  game.bestScore = best;
  game.timeEnded = new Date();
  await game.save();

  res.json({
    name: game.name,
    difficulty: game.difficulty,
    current_score: `${game.score}/${game.total}`,
    total_time_spent: totalTime,
    best_score: best ? {
      question: best.equation,
      answer: best.answer,
      time_taken: best.timeTaken
    } : null,
    history: game.history.map(q => ({
      question: q.equation,
      answer: q.answer,
      submittedAnswer: q.submittedAnswer,
      isCorrect: q.isCorrect,
      timeTaken: q.timeTaken
    }))
  });
};
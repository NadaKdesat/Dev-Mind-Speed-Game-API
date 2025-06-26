const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');

router.post('/start', gameController.startGame);
router.post('/:gameId/submit', gameController.submitAnswer);
router.get('/:gameId/end', gameController.endGame);

module.exports = router;
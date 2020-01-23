const express = require('express');

const router = express.Router();

const controller = require('../controllers/comment');

router.route('/').post(controller.comment);
router.route('/:id').post(controller.voteComment);


module.exports = router;
const express = require('express');

const router = express.Router();

const controller = require('../controllers/comment');

router.route('/').post(controller.comment);
router.route('/:id').post(controller.voteComment);
router.route('/:id').patch(controller.editComment);
router.route('/:id').delete(controller.deleteComment);

module.exports = router;
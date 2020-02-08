const express = require('express');

const router = express.Router();

const controller = require('../controllers/comment');

router.route('/:id').post(controller.comment);
router.route('/v/:id').get(controller.voteComment);
router.route('/w/:id').get(controller.unVoteComment);
router.route('/:id').patch(controller.editComment);
router.route('/:id').delete(controller.deleteComment);

module.exports = router;
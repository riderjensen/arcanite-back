const express = require('express');

const router = express.Router();

const controller = require('../controllers/post');

router.route('/').post(controller.addPost);

router.route('/:id').post(controller.votePost);
router.route('/:id').patch(controller.editPost);

module.exports = router;
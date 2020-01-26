const express = require('express');

const router = express.Router();

const controller = require('../controllers/post');

router.route('/').post(controller.addPost);
router.route('/all').get(controller.getUserPostsAndComments);
router.route('/:id').post(controller.votePost);
router.route('/:id').patch(controller.editPost);
router.route('/:id').delete(controller.deletePost);

module.exports = router;
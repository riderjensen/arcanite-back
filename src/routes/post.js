const express = require('express');

const router = express.Router();

const controller = require('../controllers/post');

router.route('/').post(controller.addPost);
router.route('/all').get(controller.getUserPostsAndComments);
router.route('/v/:id').get(controller.votePost);
router.route('/:id').get(controller.getOnePost);
router.route('/:id').patch(controller.editPost);
router.route('/:id').delete(controller.deletePost);

module.exports = router;
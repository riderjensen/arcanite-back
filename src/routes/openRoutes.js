const express = require('express');

const router = express.Router();

const controller = require('../controllers/post');

router.route('/').get(controller.getPosts);
router.route('/:id').get(controller.getOnePost);

module.exports = router;
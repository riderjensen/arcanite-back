const express = require('express');

const router = express.Router();

const controller = require('../controllers/auth');

router.route('/').get(controller.instructions);
router.route('/token').get(controller.checkAuth);
router.route('/login').post(controller.login);
router.route('/signup').post(controller.signup);

module.exports = router;
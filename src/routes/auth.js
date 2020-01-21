const express = require('express');

const router = express.Router();

const controller = require('../controllers/auth');

router.route('/login').post(controller.login);
router.route('/signup').post(controller.signup);

module.exports = router;
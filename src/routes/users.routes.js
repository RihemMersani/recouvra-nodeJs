const express = require('express');
const router = express.Router();
const usersCtrl = require('../controllers/users.controller');
const auth = require('../middlewares/auth');
const role = require('../middlewares/role');

router.get('/', auth, role('admin'), usersCtrl.list);

module.exports = router;

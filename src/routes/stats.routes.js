const express = require('express');
const router = express.Router();
const statsCtrl = require('../controllers/stats.controller');
const auth = require('../middlewares/auth');

router.use(auth);
router.get('/', statsCtrl.overview);

module.exports = router;

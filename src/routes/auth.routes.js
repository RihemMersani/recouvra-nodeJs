const express = require('express');
const router = express.Router();
const authCtrl = require('../controllers/auth.controller');
const validate = require('../middlewares/validate');
const { loginSchema, registerSchema } = require('../validations/auth.validation');

router.post('/register', validate(registerSchema), authCtrl.register);
router.post('/login', validate(loginSchema), authCtrl.login);

module.exports = router;

const express = require('express');
const router = express.Router();
const paymentsCtrl = require('../controllers/payments.controller');
const auth = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { paymentSchema } = require('../validations/payment.validation');

router.use(auth);
router.post('/', validate(paymentSchema), paymentsCtrl.create);
router.get('/', paymentsCtrl.list);

module.exports = router;

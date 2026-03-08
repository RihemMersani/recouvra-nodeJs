const express = require('express');
const router = express.Router();
const invoicesCtrl = require('../controllers/invoices.controller');
const auth = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { invoiceSchema } = require('../validations/invoice.validation');

router.use(auth);
router.post('/', validate(invoiceSchema), invoicesCtrl.create);
router.get('/', invoicesCtrl.list);
router.get('/:id', invoicesCtrl.get);
router.put('/:id', invoicesCtrl.update);
router.delete('/:id', invoicesCtrl.remove);

module.exports = router;

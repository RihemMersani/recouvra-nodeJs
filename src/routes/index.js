const express = require('express');
const auth = require('./auth.routes');
const users = require('./users.routes');
const clients = require('./clients.routes');
const invoices = require('./invoices.routes');
const payments = require('./payments.routes');
const actions = require('./actions.routes');
const stats = require('./stats.routes');

const router = express.Router();

router.use('/auth', auth);
router.use('/users', users);
router.use('/clients', clients);
router.use('/invoices', invoices);
router.use('/payments', payments);
router.use('/actions', actions);
router.use('/stats', stats);

module.exports = router;

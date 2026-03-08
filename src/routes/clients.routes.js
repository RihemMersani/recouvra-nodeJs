const express = require('express');
const router = express.Router();

const clientsCtrl = require('../controllers/clients.controller');
const auth = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { clientSchema } = require('../validations/client.validation');

router.use(auth);
router.post('/', validate(clientSchema), clientsCtrl.create);
router.get('/', clientsCtrl.list);
router.get('/:id', clientsCtrl.get);
router.put('/:id', validate(clientSchema), clientsCtrl.update);
router.delete('/:id', clientsCtrl.remove);

module.exports = router;

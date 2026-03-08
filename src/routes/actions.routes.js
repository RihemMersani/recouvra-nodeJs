const express = require('express');

const router = express.Router();
const actionsCtrl = require('../controllers/actions.controller');
const auth = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { actionSchema } = require('../validations/action.validation');

router.use(auth);
router.post('/', validate(actionSchema), actionsCtrl.create);
router.get('/', actionsCtrl.list);

module.exports = router;

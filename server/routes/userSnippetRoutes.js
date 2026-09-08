const express = require('express');
const { userAuthMiddleware } = require('../middlewares/userAuthMiddleware');
const { submitSnippet, listMySnippets, deleteMySnippet } = require('../controllers/userSnippetController');

const router = express.Router();

router.post('/', userAuthMiddleware, submitSnippet);
router.get('/', userAuthMiddleware, listMySnippets);
router.delete('/:id', userAuthMiddleware, deleteMySnippet);

module.exports = router;

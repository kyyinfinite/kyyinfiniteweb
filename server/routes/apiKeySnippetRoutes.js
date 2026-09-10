const express = require('express');
const { requireApiKey } = require('../middlewares/apiKeyAuthMiddleware');
const { apiKeyOwnerToUser } = require('../middlewares/apiKeyOwnerToUser');
const { submitSnippet, listMySnippets, deleteMySnippet } = require('../controllers/userSnippetController');

const router = express.Router();

// A key needs the `snippets:write` scope to reach any of these — it's opt-in
// per key, same as any other tool scope, not implied by having a key at all.
router.use(requireApiKey('snippets:write'), apiKeyOwnerToUser);

router.post('/', submitSnippet);
router.get('/', listMySnippets);
router.delete('/:id', deleteMySnippet);

module.exports = router;

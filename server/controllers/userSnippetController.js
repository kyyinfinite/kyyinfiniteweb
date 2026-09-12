const Snippet = require('../models/Snippet');
const UserAccount = require('../models/UserAccount');
const { dispatchEvent } = require('../services/webhookDispatcher');

const ALLOWED_LANGUAGES = ['javascript', 'typescript', 'python', 'bash', 'json'];
const MAX_SUBMISSIONS_PER_USER = 20;
const MAX_CODE_LENGTH = 300000; // ~300 KB — generous enough for a large real-world file, not just a short snippet

/** POST /api/user/snippets — submit a snippet for review; goes live once an admin approves it
 *  (or immediately, if the submitter is a verified contributor). Pass `forkedFrom` to fork
 *  an existing approved snippet. */
async function submitSnippet(req, res) {
  try {
    const { title, description = '', language, code, tags = [], forkedFrom = null } = req.body || {};

    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ message: 'title is required' });
    }
    if (title.trim().length > 120) {
      return res.status(400).json({ message: 'title must be 120 characters or fewer' });
    }
    if (!description || typeof description !== 'string' || !description.trim()) {
      return res.status(400).json({ message: 'description is required' });
    }
    if (!ALLOWED_LANGUAGES.includes(language)) {
      return res.status(400).json({ message: `language must be one of: ${ALLOWED_LANGUAGES.join(', ')}` });
    }
    if (!code || typeof code !== 'string' || !code.trim()) {
      return res.status(400).json({ message: 'code is required' });
    }
    if (code.length > MAX_CODE_LENGTH) {
      return res.status(400).json({ message: `code must be under ${MAX_CODE_LENGTH} characters` });
    }
    if (!Array.isArray(tags) || tags.some((tag) => typeof tag !== 'string')) {
      return res.status(400).json({ message: 'tags must be an array of strings' });
    }

    let forkedFromId = null;
    if (forkedFrom) {
      const original = await Snippet.findOne({ _id: forkedFrom, status: 'approved', isPublished: true }).select('_id').lean();
      if (!original) {
        return res.status(400).json({ message: 'The snippet you tried to fork from was not found' });
      }
      forkedFromId = original._id;
    }

    const totalEverSubmitted = await Snippet.countDocuments({ ownerUid: req.user.uid, source: 'community' });
    if (totalEverSubmitted >= MAX_SUBMISSIONS_PER_USER) {
      return res.status(429).json({
        message: `You've reached the limit of ${MAX_SUBMISSIONS_PER_USER} submitted snippets.`,
        limitReached: true,
      });
    }

    const account = await UserAccount.findOne({ uid: req.user.uid }).select('isVerifiedContributor').lean();
    const autoApproved = Boolean(account?.isVerifiedContributor);

    const snippet = await Snippet.create({
      title: title.trim(),
      description: description.trim(),
      language,
      code,
      tags: tags.map((tag) => tag.trim().toLowerCase()).filter(Boolean).slice(0, 8),
      source: 'community',
      status: autoApproved ? 'approved' : 'pending',
      isPublished: true,
      ownerUid: req.user.uid,
      ownerLabel: req.user.displayName || req.user.username || req.user.email || 'anonymous',
      forkedFrom: forkedFromId,
    });

    if (autoApproved) {
      dispatchEvent('snippet.approved', { snippetId: snippet._id, title: snippet.title }, { ownerUid: req.user.uid });
    }

    return res.status(201).json({
      snippet,
      message: autoApproved
        ? "You're a verified contributor — this is live now."
        : 'Submitted — it will appear once an admin reviews it.',
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to submit snippet', error: error.message });
  }
}

/** GET /api/user/snippets — snippets the logged-in user has submitted, any status. */
async function listMySnippets(req, res) {
  try {
    const snippets = await Snippet.find({ ownerUid: req.user.uid, source: 'community' })
      .sort({ createdAt: -1 })
      .lean();
    return res.status(200).json({ snippets, limit: MAX_SUBMISSIONS_PER_USER });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to list your snippets', error: error.message });
  }
}

/** DELETE /api/user/snippets/:id — user can withdraw their own submission (any status). */
async function deleteMySnippet(req, res) {
  try {
    const snippet = await Snippet.findOneAndDelete({ _id: req.params.id, ownerUid: req.user.uid, source: 'community' });
    if (!snippet) {
      return res.status(404).json({ message: 'Snippet not found' });
    }
    return res.status(200).json({ message: 'Snippet withdrawn' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to withdraw snippet', error: error.message });
  }
}

module.exports = { submitSnippet, listMySnippets, deleteMySnippet, ALLOWED_LANGUAGES, MAX_SUBMISSIONS_PER_USER };

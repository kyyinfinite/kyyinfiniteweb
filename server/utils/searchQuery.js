/**
 * Case-insensitive substring search across multiple fields, with no
 * dependency on a MongoDB text index existing. $text search was here before
 * and looked cleaner, but a missing or stale text index (easy to end up with
 * on a serverless deploy) turns every search request into a 500 — this
 * can't fail that way since it doesn't need any index to be present at all.
 *
 * @param {string[]} fields - field names to match against (array fields like `tags` work too)
 * @param {string} search - raw user input
 * @returns {object|null} a MongoDB filter fragment (an `$or` clause), or null if search is empty
 */
function buildSearchFilter(fields, search) {
  const trimmed = (search || '').trim();
  if (!trimmed) return null;

  // Escape regex special characters so odd input (parentheses, asterisks,
  // etc.) can't throw a regex-compile error or do anything unexpected.
  const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(escaped, 'i');

  return { $or: fields.map((field) => ({ [field]: pattern })) };
}

module.exports = { buildSearchFilter };

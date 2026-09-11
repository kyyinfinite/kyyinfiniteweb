/**
 * Endpoints that aren't simple GET proxies — so they live in their own
 * controllers/routes instead of config/apiRegistry.js — but should still
 * show up (and be testable) in the API Playground. Keep this in sync with
 * whatever custom routes get added under /api/v1/*.
 */
const CUSTOM_ENDPOINTS_META = [
  {
    path: '/am/send',
    method: 'POST',
    title: 'Alight Motion — Send Activation Link',
    description: 'Sends the customer an Alight Motion Pro verification link by email.',
    responseType: 'json',
    scope: 'am:premium',
    cached: false,
    params: [{ name: 'email', required: true, description: "Customer's email address" }],
  },
  {
    path: '/am/verify',
    method: 'POST',
    title: 'Alight Motion — Verify Activation',
    description: "Verifies the link the customer clicked and activates their Pro account.",
    responseType: 'json',
    scope: 'am:premium',
    cached: false,
    params: [
      { name: 'email', required: true, description: "Customer's email address" },
      { name: 'link', required: true, description: 'Verification link from the email' },
    ],
  },
];

module.exports = { CUSTOM_ENDPOINTS_META };

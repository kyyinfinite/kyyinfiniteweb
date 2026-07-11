/**
 * Transformer default dipakai kalau entry di apiRegistry tidak menunjuk
 * transformer khusus. Upstream naruh data hasil di key yang beda-beda
 * (result / data / root) — di sini diseragamkan ke satu bentuk.
 */
function defaultTransformer(upstreamJson) {
  const result =
    upstreamJson.result !== undefined
      ? upstreamJson.result
      : upstreamJson.data !== undefined
        ? upstreamJson.data
        : upstreamJson;

  return { status: true, creator: 'KyyInfinite', result };
}

module.exports = { default: defaultTransformer };

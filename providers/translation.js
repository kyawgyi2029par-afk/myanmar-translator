async function translateSegments(segments, targetLang) {
  return segments.map(seg => ({
    ...seg,
    text: `(Translated to ${targetLang}) ${seg.text}`
  }));
}

module.exports = { translateSegments };


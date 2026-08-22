const fs = require('fs');

async function transcribe(audioPath) {
  // Placeholder for STT provider (e.g., OpenAI Whisper / Google Speech)
  return [
    { start: 0, end: 5, text: "Hello world" }
  ];
}

module.exports = { transcribe };


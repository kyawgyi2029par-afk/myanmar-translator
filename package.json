require('dotenv').config();
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const { v4: uuidv4 } = require('uuid');
const { extractAudio, mergeAudioVideo } = require('./ffmpeg-helper');
const sttProvider = require('./providers/stt');
const translationProvider = require('./providers/translation');
const ttsProvider = require('./providers/tts');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, 'uploads', uuidv4());
    fs.ensureDirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `input${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.mp4', '.mov', '.webm'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) return cb(null, true);
    cb(new Error('Invalid video format.'));
  }
});

app.post('/api/upload', upload.single('video'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No video provided.' });
  const jobId = path.basename(req.file.destination);
  res.json({ jobId, filename: req.file.originalname, size: req.file.size });
});

app.post('/api/transcribe', async (req, res) => {
  const { jobId } = req.body;
  const jobDir = path.join(__dirname, 'uploads', jobId);
  try {
    const files = await fs.readdir(jobDir);
    const videoFile = files.find(f => f.startsWith('input'));
    const videoPath = path.join(jobDir, videoFile);
    const audioPath = path.join(jobDir, 'extracted_audio.mp3');

    await extractAudio(videoPath, audioPath);
    const transcript = await sttProvider.transcribe(audioPath);
    res.json({ success: true, transcript });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/translate', async (req, res) => {
  const { transcript } = req.body;
  try {
    const translated = await translationProvider.translateSegments(transcript, 'my');
    res.json({ success: true, translatedTranscript: translated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/render', async (req, res) => {
  const { jobId, segments, voiceGender } = req.body;
  const jobDir = path.join(__dirname, 'uploads', jobId);
  try {
    const files = await fs.readdir(jobDir);
    const videoFile = files.find(f => f.startsWith('input'));
    const videoPath = path.join(jobDir, videoFile);
    
    const audioSegments = await ttsProvider.generateVoiceover(jobDir, segments, voiceGender);
    const outputPath = path.join(jobDir, 'final_localized.mp4');
    await mergeAudioVideo(videoPath, audioSegments, outputPath);

    res.json({ success: true, downloadUrl: `/api/download/${jobId}/final_localized.mp4` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/download/:jobId/:filename', (req, res) => {
  const file = path.join(__dirname, 'uploads', req.params.jobId, req.params.filename);
  if (fs.existsSync(file)) res.download(file);
  else res.status(404).json({ error: 'File not found.' });
});

app.listen(PORT, () => console.log(`Server on port ${PORT}`));


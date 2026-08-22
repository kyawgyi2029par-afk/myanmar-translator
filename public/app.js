async function uploadVideo() {
  const fileInput = document.getElementById('videoFile');
  if (!fileInput.files[0]) return alert('ဗွီဒီယိုဖိုင် ရွေးပါ');
  const formData = new FormData();
  formData.append('video', fileInput.files[0]);
  
  document.getElementById('status').innerText = 'တင်နေပါပြီ...';
  const res = await fetch('/api/upload', { method: 'POST', body: formData });
  const data = await res.json();
  if (data.jobId) {
    document.getElementById('status').innerText = 'တင်ပြီးပါပြီ။';
  }
}


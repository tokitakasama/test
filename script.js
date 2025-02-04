const fileInput = document.getElementById('fileInput');
const video = document.getElementById('video');
const hls = new HLS();

fileInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  const fileURL = URL.createObjectURL(file);

  if (HLS.isSupported()) {
    hls.attachMedia(video);
    hls.loadSource(fileURL);
  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = fileURL;
  }
});

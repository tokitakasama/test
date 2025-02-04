const video = document.getElementById('video');
const hls = new HLS();

if (HLS.isSupported()) {
  hls.attachMedia(video);
  hls.loadSource('your_m3u8_file.m3u8');
} else if (video.canPlayType('application/vnd.apple.mpegurl')) {
  video.src = 'your_m3u8_file.m3u8';
}

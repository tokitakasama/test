const fileInput = document.getElementById('fileInput');
const video = document.getElementById('video');
const hls = new HLS();

fileInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  const reader = new FileReader();

  reader.onload = (event) => {
    const m3u8Content = event.target.result;

    // m3u8ファイルを解析
    const segments = parseM3U8(m3u8Content);

    // 分割数
    const numParts = 41;

    // 分割されたm3u8ファイルを作成
    const parts = splitM3U8(segments, numParts);

    // 分割されたm3u8ファイルをダウンロード
    for (let i = 0; i < parts.length; i++) {
      const blob = new Blob([parts[i]], { type: 'application/vnd.apple.mpegurl' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `part${i + 1}.m3u8`;
      a.click();
      URL.revokeObjectURL(url); // メモリ解放
    }

    // 分割されたm3u8ファイルを選択してストリーミング再生
    const partFileInput = document.createElement('input');
    partFileInput.type = 'file';
    partFileInput.accept = '.m3u8';
    partFileInput.addEventListener('change', (event) => {
      const partFile = event.target.files[0];
      const partFileURL = URL.createObjectURL(partFile);

      if (HLS.isSupported()) {
        hls.attachMedia(video);
        hls.loadSource(partFileURL);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = partFileURL;
      }
    });
    partFileInput.click();
  };

  reader.readAsText(file);
});

// m3u8ファイルを解析する関数
function parseM3U8(content) {
  const lines = content.split('\n');
  const segments = [];
  for (const line of lines) {
    if (line.startsWith('#EXTINF')) {
      const duration = parseFloat(line.split(':')[1]);
      const url = lines[lines.indexOf(line) + 1];
      segments.push({ duration, url });
    }
  }
  return segments;
}

// m3u8ファイルを分割する関数
function splitM3U8(segments, numParts) {
  const partSize = Math.ceil(segments.length / numParts);
  const parts = [];
  for (let i = 0; i < numParts; i++) {
    const start = i * partSize;
    const end = Math.min((i + 1) * partSize, segments.length);
    const partSegments = segments.slice(start, end);
    let partContent = '#EXTM3U\n';
    for (const segment of partSegments) {
      partContent += `#EXTINF:${segment.duration}\n${segment.url}\n`;
    }
    parts.push(partContent);
  }
  return parts;
}

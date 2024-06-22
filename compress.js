// Class HuffmanNode untuk representasi simpul dalam pohon Huffman
class HuffmanNode {
  constructor(symbol, frequency, left = null, right = null) {
    this.symbol = symbol;
    this.frequency = frequency;
    this.left = left;
    this.right = right;
  }
}

// Fungsi untuk menghitung frekuensi masing-masing byte dalam video
function calculateFrequency(data) {
  const frequency = {};
  for (let i = 0; i < data.length; i++) {
    const byte = data[i];
    frequency[byte] = (frequency[byte] || 0) + 1;
  }
  return frequency;
}

// Fungsi untuk membangun pohon Huffman dari tabel frekuensi
function buildHuffmanTree(frequency) {
  const nodes = Object.entries(frequency).map(([symbol, frequency]) => new HuffmanNode(symbol, frequency));
  
  while (nodes.length > 1) {
    nodes.sort((a, b) => a.frequency - b.frequency);
    const left = nodes.shift();
    const right = nodes.shift();
    const newNode = new HuffmanNode(null, left.frequency + right.frequency, left, right);
    nodes.push(newNode);
  }
  
  return nodes[0];
}

// Fungsi rekursif untuk membangun tabel kode Huffman dari pohon Huffman
function buildHuffmanCodes(node, prefix = '', codeTable = {}) {
  if (node.left === null && node.right === null) {
    codeTable[node.symbol] = prefix;
    return codeTable;
  }
  if (node.left) buildHuffmanCodes(node.left, prefix + '0', codeTable);
  if (node.right) buildHuffmanCodes(node.right, prefix + '1', codeTable);
  return codeTable;
}

// Fungsi untuk mengkodekan data video menggunakan tabel kode Huffman
function huffmanEncode(data, huffmanCodes) {
  return data.map(byte => huffmanCodes[byte]).join('');
}

// Fungsi untuk mendekode hasil kompresi Huffman
function huffmanDecode(encodedData, huffmanTree) {
  let decodedData = [];
  let node = huffmanTree;
  for (const bit of encodedData) {
    node = bit === '0' ? node.left : node.right;
    if (node.left === null && node.right === null) {
      decodedData.push(parseInt(node.symbol));
      node = huffmanTree;
    }
  }
  return new Uint8Array(decodedData);
}

// Mengambil elemen-elemen dari DOM
const fileInput = document.getElementById('file-input');
const compressButton = document.getElementById('compress-button');
const downloadButton = document.getElementById('download-button');
const algorithmSelect = document.getElementById('algorithm-select');
const video = document.getElementById('video');
const videoInfoDiv = document.querySelector('.video-info');

let videoData;
let compressedVideo;

// Event listener untuk input file
fileInput.addEventListener('change', (e) => {
  const file = fileInput.files[0];
  const reader = new FileReader();
  reader.onload = async (e) => {
    videoData = new Uint8Array(e.target.result);
    video.src = URL.createObjectURL(new Blob([videoData], { type: 'video/mp4' }));
    compressButton.disabled = false;

    // Menampilkan informasi video
    const videoDuration = await getVideoDuration(file);
    const videoSize = formatBytes(file.size);
    videoInfoDiv.innerHTML = `
      <p><strong>Nama Video:</strong> ${file.name}</p>
      <p><strong>Durasi:</strong> ${videoDuration}</p>
      <p><strong>Ukuran:</strong> ${videoSize}</p>
    `;
    videoInfoDiv.style.display = 'block';
  };
  reader.readAsArrayBuffer(file);
});

// Fungsi untuk mendapatkan durasi video
function getVideoDuration(file) {
  const video = document.createElement('video');
  video.src = URL.createObjectURL(file);
  return new Promise((resolve) => {
    video.onloadedmetadata = () => {
      resolve(formatTime(video.duration));
    };
  });
}

// Fungsi untuk memformat durasi dalam format jam:menit:detik
function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return `${hours}:${minutes}:${secs}`;
}

// Fungsi untuk memformat ukuran file dalam byte, KB, MB, dll.
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Event listener untuk tombol kompresi
compressButton.addEventListener('click', () => {
  const algorithm = algorithmSelect.value;
  if (algorithm === 'huffman') {
    const frequency = calculateFrequency(videoData);
    const huffmanTree = buildHuffmanTree(frequency);
    const huffmanCodes = buildHuffmanCodes(huffmanTree);
    const encodedData = huffmanEncode(Array.from(videoData), huffmanCodes);
    compressedVideo = huffmanDecode(encodedData, huffmanTree);
    showDownloadLink();
  } else {
    // Arithmetic compression will be implemented here
    console.log("Arithmetic compression is not yet implemented.");
  }
});

// Event listener untuk tombol download
downloadButton.addEventListener('click', () => {
  const blob = new Blob([compressedVideo], { type: 'video/mp4' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'compressed_video.mp4';
  a.click();
});

// Fungsi untuk menampilkan tombol download setelah kompresi selesai
function showDownloadLink() {
  document.getElementById('download-section').style.display = 'block';
}

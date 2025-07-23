const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file');
const fileStatus = document.getElementById('file-status');

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, e => {
        e.preventDefault();
        e.stopPropagation();
    });
});

fileInput.addEventListener('change', (event) => {
    updateFileStatus(fileInput.files.length);
    const files = event.target.files;
    handleFiles(files);
});

dropZone.addEventListener('drop', (event) => {
    event.preventDefault(); 
    const files = event.dataTransfer.files;
    if (files.length > 0) {
        fileInput.files = files;
        updateFileStatus(files.length);
        handleFiles(files);
    }
});

function updateFileStatus(count) {
    fileStatus.className = 'upload-status';
    if (count != 0) {
        fileStatus.textContent = `${count} file${count > 1 ? 's' : ''} uploaded!`;

    }
}

function handleFiles(files) {
    const reader = new FileReader();
    Object.keys(files).forEach((i) => {
        const file = files[i];
        if (!file) {
            console.error("No file selected.");
            return;
        }
        reader.onload = function (e) {
            let arrayBuffer = new Uint8Array(reader.result);
            console.log(arrayBuffer);
        }
        reader.readAsArrayBuffer(file);
    });
}    


async function GenerateKey() {
    const key = await crypto.subtle.generateKey(
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"]
    );
    return key;
}

async function encryptData(fileContent) {
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const key = await GenerateKey();
    const encryptedContent = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv: iv, tagLength: 128 },
        key,
        fileContent
    );

    const rawKey = await crypto.subtle.exportKey("raw", key);
    return {
        ciphertext: new Uint8Array(encryptedContent),
        iv: iv,
        key: new Uint8Array(rawKey),
    };
}
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


async function SendFileToRazor(file, encrypted) {
    const dataToSend = {
        Name: file.name,
        Ciphertext: encrypted.ciphertext, 
        IV: encrypted.iv,                 
    };
    const token = document.querySelector('input[name="__RequestVerificationToken"]')?.value;
    console.log(dataToSend);
    await fetch(window.location.pathname, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'RequestVerificationToken': token
        },
        body: JSON.stringify(dataToSend),
    });
}

function handleFiles(files) {
    Object.keys(files).forEach((i) => {
        const file = files[i];
        if (!file) {
            console.error("No file selected.");
            return;
        }

        const reader = new FileReader();
        reader.onload = async function () {
            const arrayBuffer = new Uint8Array(reader.result);
            const encrypted = await encryptData(arrayBuffer);
            await SendFileToRazor(file, encrypted);
        };

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
        ciphertext: btoa(String.fromCharCode(...new Uint8Array(encryptedContent))),
        iv: btoa(String.fromCharCode(...iv)),
        key: btoa(String.fromCharCode(...new Uint8Array(rawKey))),
    };
}
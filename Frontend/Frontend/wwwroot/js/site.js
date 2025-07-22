const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file');
const fileStatus = document.getElementById('file-status');

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, e => {
        e.preventDefault();
        e.stopPropagation();
    });
});

dropZone.addEventListener('drop', e => {
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        fileInput.files = files;
        updateFileStatus(files.length);
    }
});

fileInput.addEventListener('change', () => {
    updateFileStatus(fileInput.files.length);
});

function updateFileStatus(count) {
    fileStatus.className = 'upload-status';
    fileStatus.textContent = `${count} file${count > 1 ? 's' : ''} uploaded!`;
}

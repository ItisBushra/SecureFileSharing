const dropZone = document.getElementById('drop-zone-enc');
const linkContainer = document.getElementById('generated-link');
const fileInput = document.getElementById('file-enc');
const warningContainer = document.getElementById('file-number-warning-enc');
const typeWarning = document.getElementById("file-type-warning-enc");
const dateBtn = document.getElementById("experationBtn");
const fileTypes = ["txt", "xml", "html", "css", "png", "jpg", "jpeg", "gif", "bmp",
    "webp", "sqlite", "db", "csv", "json", "pdf", "docx", "xlsx", "pptx", "mp3", "wav",
    "mp4", "webm", "svg", "exe", "dll", "app", "sql"];

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, e => {
        e.preventDefault();
        e.stopPropagation();
    });
});

fileInput.addEventListener('change', (event) => {
    const files = event.target.files;
    ValidateFile(files, warningContainer, fileInput);
});

dropZone.addEventListener('drop', (event) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files.length > 0) {
        fileInput.files = files;
        ValidateFile(files, warningContainer, fileInput);
    }
});

document.addEventListener('DOMContentLoaded', function () {
    const tabs = document.querySelectorAll('.nav-tabs .nav-link');

    tabs.forEach(tab => {
        tab.addEventListener('click', function () {
            const tabId = this.getAttribute('data-tab');
            localStorage.setItem('activeTab', tabId);
        });
    });

    const savedTab = localStorage.getItem('activeTab');
    if (savedTab) {
        const tabToActivate = document.querySelector(`.nav-link[data-tab="${savedTab}"]`);
        if (tabToActivate) {
            tabToActivate.click();
        }
    }
});

function ValidateFile(files, warningContainer, fileInput) {
    warningContainer.innerHTML = '';
    const maxSize = 5 * 1024 * 1024;
    const file = files[0];

    if (!files || files.length === 0) return;

    if (files.length !== 1) {
        fileInput.value = '';
        warningContainer.innerHTML = `
            <div style="text-align:center; margin-top: 1rem;">
                <span style="color:red;">Please upload only one file.</span>
            </div>`;

        return;
    }

    if (file.size > maxSize) {
        const linkContainer = document.getElementById('file-size-warning');
        linkContainer.innerHTML = `
              <div style="text-align:center; margin-top: 1rem;">
                <span style="color:red;">The selected file is too large. Please upload a file under 5MB</span>
              </div>`;

        return;
    }

    var fileName = file.name;
    const lastDotIndex = fileName.lastIndexOf('.');
    var fileType = fileName.slice(lastDotIndex + 1);
    let isValid = false;
    fileTypes.forEach(allowedType => {
        if (fileType === allowedType) {
            isValid = true;
        }
    });
    if (isValid == false) {
        typeWarning.innerHTML = `
            <div style="text-align:center; margin-top: 1rem;">
                <span style="color:red;">The uploaded file format cannot be encrypted, Please check the file and try again.</span>
            </div>`;
        return;
    }

    //once validated
    dateBtn.style.display = 'block';
    linkContainer.innerHTML = '';
}
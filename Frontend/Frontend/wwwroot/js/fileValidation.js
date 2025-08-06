const dropZone = document.getElementById('drop-zone-enc');
const fileInput = document.getElementById('file-enc');
const warningContainer = document.getElementById('file-number-warning-enc');
const dateBtn = document.getElementById("experationBtn");

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
    //once validated
    dateBtn.style.display = 'block';
}
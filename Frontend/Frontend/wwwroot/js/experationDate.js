const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file');
const dateButton = document.querySelector('.experation-date');
const timePicker = document.getElementById('datetimepicker4');
let selectedExpirationDate = null;
let flatpickrInstance = null; 
let autoDelete = false;

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, e => {
        e.preventDefault();
        e.stopPropagation();
    });
});

fileInput.addEventListener('change', (event) => {
    const files = event.target.files;
    updateFileStatus(files);
});

dropZone.addEventListener('drop', (event) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files.length > 0) {
        fileInput.files = files;
        updateFileStatus(files);
    }
});

document.getElementById('calendarModal').addEventListener('shown.bs.modal', function () {
    if (!flatpickrInstance) {
        flatpickrInstance = flatpickr(timePicker, {
            enableTime: true,
            dateFormat: "F j, Y at H:i",
            minuteIncrement: 1,
            position: "below",
            minDate: new Date(),
            onOpen: function (selectedDates, dateStr, instance) {
                setTimeout(() => {
                    const calendar = instance.calendarContainer;
                    calendar.style.left = '50%';
                    calendar.style.transform = 'translateX(-50%)';
                }, 0);
            },
            onChange: function (selectedDates) {
                selectedExpirationDate = selectedDates[0];
            }
        });
    }

});

const modal = new bootstrap.Modal(document.getElementById('calendarModal'));
document.getElementById('flexCheckDefault').addEventListener('change', function () {
    autoDelete = this.checked;
});

document.getElementById("saveDateBtn")?.addEventListener("click", function () {
    dateButton.style.display = 'none';
    modal.hide();
    finalDate = selectedExpirationDate;
    handleFile(fileInput.files, finalDate, autoDelete);
});

document.getElementById("noExpirationBtn")?.addEventListener("click", function () {
    modal.hide();
    dateButton.style.display = 'none';
    handleFile(fileInput.files, null, false);
});
function updateFileStatus(files) {
    if (!files || files.length == 0) {
        console.error("No file selected.");
        return;
    }

    const fileNumberContainer = document.getElementById('file-number-warning');
    fileNumberContainer.innerHTML = '';

    if (files.length !== 1) {
        fileInput.value = '';
        fileNumberContainer.innerHTML = `
              <div style="text-align:center; margin-top: 1rem;">
                <span style="color:red;">Please upload only one file.</span>
              </div>`;
        return;
    }
    dateButton.style.display = 'block';
}
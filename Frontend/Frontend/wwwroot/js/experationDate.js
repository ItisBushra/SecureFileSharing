const dateButton = document.querySelector('.experation-date');
const timePicker = document.getElementById('datetimepicker4');
const modal = new bootstrap.Modal(document.getElementById('calendarModal'));
let selectedExpirationDate = null;
let flatpickrInstance = null; 
let autoDelete = false;

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

document.getElementById('flexCheckDefault').addEventListener('change', function () {
    autoDelete = this.checked;
});

document.getElementById("saveDateBtn")?.addEventListener("click", function () {
    dateButton.style.display = 'none';
    modal.hide();
    finalDate = selectedExpirationDate;
    const passwordInput = document.getElementById('password').value;
    console.log(passwordInput);
    handleFile(fileInput.files, finalDate, autoDelete, passwordInput);
});

document.getElementById("noExpirationBtn")?.addEventListener("click", function () {
    modal.hide();
    dateButton.style.display = 'none';
    const passwordInput = document.getElementById('password').value;
    console.log(passwordInput);
    handleFile(fileInput.files, null, false, passwordInput);
});
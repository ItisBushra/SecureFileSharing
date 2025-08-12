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

document.getElementById('calendarModal').addEventListener('hidden.bs.modal', function () {
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) {
        backdrop.remove();
    }
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
});

document.getElementById('flexCheckDefault').addEventListener('change', function () {
    autoDelete = this.checked;
});
document.getElementById("saveDateBtn")?.addEventListener("click", function (e) {
    const passwordInput = document.getElementById('password');
    const password = passwordInput.value.trim();

    if (!password) {
        e.preventDefault();
        passwordInput.focus();
        return;
    } else {
        dateButton.style.display = 'none';
        modal.hide();
        finalDate = selectedExpirationDate;
        handleFile(fileInput.files, finalDate, autoDelete, password);
    }
});

document.getElementById("noExpirationBtn")?.addEventListener("click", function (e) {
    const passwordInput = document.getElementById('password');
    const password = passwordInput.value.trim();

    if (!password) {
        e.preventDefault();
        passwordInput.focus();
        return;

    } else {
        modal.hide();
        dateButton.style.display = 'none';
        handleFile(fileInput.files, null, false, password);
    }
});
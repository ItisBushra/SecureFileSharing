document.addEventListener('DOMContentLoaded', function () {
    flatpickr("#datetimepicker4", {
        enableTime: true,
        dateFormat: "Y-m-d H:i",
        minuteIncrement: 1,
        position: "below",
        onOpen: function (selectedDates, dateStr, instance) {
            setTimeout(() => {
                const calendar = instance.calendarContainer;
                calendar.style.left = '50%';
                calendar.style.transform = 'translateX(-50%)';
            }, 0);
        }
    });
    const modal = new bootstrap.Modal(document.getElementById('calendarModal'));
    document.getElementById("saveDateBtn").addEventListener("click", function () {
        modal.hide();
    });

    document.getElementById("noExpirationBtn").addEventListener("click", function (e) {
        modal.hide();
    });
});
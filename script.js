document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    const startTodayBtn = document.getElementById('start-today');
    const endTodayBtn = document.getElementById('end-today');
    const calculateBtn = document.getElementById('calculate');
    const startTimerBtn = document.getElementById('start-timer');
    const completeTimerBtn = document.getElementById('complete-timer');
    const resetTimerBtn = document.getElementById('reset-timer');

    const initialDurationSection = document.getElementById('initial-duration');
    const initialMonthsSpan = document.getElementById('initial-months');
    const initialWeeksSpan = document.getElementById('initial-weeks');
    const initialDaysSpan = document.getElementById('initial-days');
    const initialHoursSpan = document.getElementById('initial-hours');
    const initialMinutesSpan = document.getElementById('initial-minutes');
    const initialSecondsSpan = document.getElementById('initial-seconds');

    const countdownDisplaySection = document.getElementById('countdown-display');
    const countdownMessage = document.getElementById('countdown-message');

    // Elapsed Time Spans
    const elapsedMonthsSpan = document.getElementById('elapsed-months');
    const elapsedWeeksSpan = document.getElementById('elapsed-weeks');
    const elapsedDaysSpan = document.getElementById('elapsed-days');
    const elapsedHoursSpan = document.getElementById('elapsed-hours');
    const elapsedMinutesSpan = document.getElementById('elapsed-minutes');
    const elapsedSecondsSpan = document.getElementById('elapsed-seconds');

    // Remaining Time (Center - Large) Spans
    const remainingDaysLgSpan = document.getElementById('remaining-days-lg');
    const remainingHoursLgSpan = document.getElementById('remaining-hours-lg');
    const remainingMinutesLgSpan = document.getElementById('remaining-minutes-lg');
    const remainingSecondsLgSpan = document.getElementById('remaining-seconds-lg');

    // Remaining Time (Bottom - Detailed) Spans
    const remainingMonthsSpan = document.getElementById('remaining-months');
    const remainingWeeksSpan = document.getElementById('remaining-weeks');
    const remainingDaysSpan = document.getElementById('remaining-days');
    const remainingHoursSpan = document.getElementById('remaining-hours');
    const remainingMinutesSpan = document.getElementById('remaining-minutes');
    const remainingSecondsSpan = document.getElementById('remaining-seconds');

    // --- State Variables ---
    let countdownInterval = null;
    let targetEndDate = null;
    let initialStartDate = null;

    // --- Constants ---
    const MS_PER_SECOND = 1000;
    const MS_PER_MINUTE = 60 * MS_PER_SECOND;
    const MS_PER_HOUR = 60 * MS_PER_MINUTE;
    const MS_PER_DAY = 24 * MS_PER_HOUR;
    const MS_PER_WEEK = 7 * MS_PER_DAY;
    const MS_PER_MONTH = 30.4375 * MS_PER_DAY; // Average month length approximation

    // --- Helper Functions ---
    const formatNumber = (num) => num.toString().padStart(2, '0');

    // Formats Date object to 'YYYY-MM-DDTHH:mm' for datetime-local input
    // Includes seconds for better precision if needed, though input doesn't show them
    const formatDateTimeLocal = (date) => {
        const year = date.getFullYear();
        const month = formatNumber(date.getMonth() + 1);
        const day = formatNumber(date.getDate());
        const hours = formatNumber(date.getHours());
        const minutes = formatNumber(date.getMinutes());
        // const seconds = formatNumber(date.getSeconds()); // Optional: include seconds
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    // Calculates time breakdown from milliseconds
    const getTimeBreakdown = (ms) => {
        if (isNaN(ms)) return createZeroBreakdown(); // Handle NaN input
        const isNegative = ms < 0;
        ms = Math.abs(ms); // Work with positive values for calculation

        const totalSeconds = Math.floor(ms / MS_PER_SECOND);
        const totalMinutes = Math.floor(ms / MS_PER_MINUTE);
        const totalHours = Math.floor(ms / MS_PER_HOUR);
        const totalDays = Math.floor(ms / MS_PER_DAY);
        const totalWeeks = Math.floor(ms / MS_PER_WEEK);
        const totalMonths = Math.floor(ms / MS_PER_MONTH); // Approximation

        let remainingMs = ms;

        const months = Math.floor(remainingMs / MS_PER_MONTH);
        remainingMs %= MS_PER_MONTH;

        const weeks = Math.floor(remainingMs / MS_PER_WEEK);
        remainingMs %= MS_PER_WEEK;

        const days = Math.floor(remainingMs / MS_PER_DAY);
        remainingMs %= MS_PER_DAY;

        const hours = Math.floor(remainingMs / MS_PER_HOUR);
        remainingMs %= MS_PER_HOUR;

        const minutes = Math.floor(remainingMs / MS_PER_MINUTE);
        remainingMs %= MS_PER_MINUTE;

        const seconds = Math.floor(remainingMs / MS_PER_SECOND);

        return {
            isNegative, // Indicate if the original time was negative (countdown passed)
            totalMonths, totalWeeks, totalDays, totalHours, totalMinutes, totalSeconds,
            months, weeks, days, hours, minutes, seconds
        };
    };

    // Helper to create a zeroed-out breakdown object
    const createZeroBreakdown = () => ({
        isNegative: false, totalMonths: 0, totalWeeks: 0, totalDays: 0, totalHours: 0, totalMinutes: 0, totalSeconds: 0,
        months: 0, weeks: 0, days: 0, hours: 0, minutes: 0, seconds: 0
    });

    // Updates the display elements
    const updateDisplay = (elapsedMs, remainingMs) => {
        const elapsed = getTimeBreakdown(elapsedMs);
        const remaining = getTimeBreakdown(remainingMs);

        // Update Elapsed Time
        elapsedMonthsSpan.textContent = elapsed.months;
        elapsedWeeksSpan.textContent = elapsed.weeks;
        elapsedDaysSpan.textContent = elapsed.days;
        elapsedHoursSpan.textContent = formatNumber(elapsed.hours);
        elapsedMinutesSpan.textContent = formatNumber(elapsed.minutes);
        elapsedSecondsSpan.textContent = formatNumber(elapsed.seconds);

        // Update Remaining Time (Center - Large) - Show total remaining days
        remainingDaysLgSpan.textContent = formatNumber(remaining.totalDays);
        remainingHoursLgSpan.textContent = formatNumber(remaining.hours);
        remainingMinutesLgSpan.textContent = formatNumber(remaining.minutes);
        remainingSecondsLgSpan.textContent = formatNumber(remaining.seconds);

        // Update Remaining Time (Bottom - Detailed)
        remainingMonthsSpan.textContent = remaining.months;
        remainingWeeksSpan.textContent = remaining.weeks;
        remainingDaysSpan.textContent = remaining.days;
        remainingHoursSpan.textContent = formatNumber(remaining.hours);
        remainingMinutesSpan.textContent = formatNumber(remaining.minutes);
        remainingSecondsSpan.textContent = formatNumber(remaining.seconds);

        // Handle countdown completion or if it has passed
        if (remainingMs <= 0) {
            if (countdownInterval) { // Only clear interval if it's running
                 clearInterval(countdownInterval);
                 countdownInterval = null;
                 localStorage.setItem('countdownActive', 'false');
                 setButtonStates(false); // Reset button states (allow new calculation)
                 completeTimerBtn.disabled = true; // Disable complete button after finish/pass
            }
            // Display 0 for remaining time if exactly zero or negative
            remainingDaysLgSpan.textContent = '00';
            remainingHoursLgSpan.textContent = '00';
            remainingMinutesLgSpan.textContent = '00';
            remainingSecondsLgSpan.textContent = '00';
            remainingMonthsSpan.textContent = '0';
            remainingWeeksSpan.textContent = '0';
            remainingDaysSpan.textContent = '0';
            remainingHoursSpan.textContent = '00';
            remainingMinutesSpan.textContent = '00';
            remainingSecondsSpan.textContent = '00';

            countdownMessage.textContent = "Countdown Finished!";
            countdownMessage.style.color = 'var(--success-color)';

        } else {
             countdownMessage.textContent = "Countdown Running..."; // Clear message if running
             countdownMessage.style.color = 'var(--tertiary-accent)';
        }
    };

    // Sets the state of buttons and inputs based on countdown status
    const setButtonStates = (isCounting, isCalculated = false) => {
        const hasDates = initialStartDate && targetEndDate;

        startDateInput.disabled = isCounting;
        endDateInput.disabled = isCounting;
        startTodayBtn.disabled = isCounting;
        endTodayBtn.disabled = isCounting;
        calculateBtn.disabled = isCounting;

        // Start button enabled only if calculated but not counting
        startTimerBtn.disabled = isCounting || !isCalculated || !hasDates;

        // Complete button enabled only if actively counting
        completeTimerBtn.disabled = !isCounting;

        // Reset button always enabled
        resetTimerBtn.disabled = false;
    };

    // --- Core Logic Functions ---
    const calculateInitialDuration = () => {
        const startValue = startDateInput.value;
        const endValue = endDateInput.value;

        if (!startValue || !endValue) {
            showStatusMessage("Please select both start and end dates.", true);
            return false; // Indicate failure
        }

        initialStartDate = new Date(startValue);
        targetEndDate = new Date(endValue);

        if (isNaN(initialStartDate.getTime()) || isNaN(targetEndDate.getTime())) {
             showStatusMessage("Invalid date format selected.", true);
             initialStartDate = null;
             targetEndDate = null;
             return false; // Indicate failure
        }

        if (targetEndDate <= initialStartDate) {
            showStatusMessage("End date must be after the start date.", true);
            initialStartDate = null;
            targetEndDate = null;
            return false; // Indicate failure
        }

        const totalDurationMs = targetEndDate.getTime() - initialStartDate.getTime();
        const duration = getTimeBreakdown(totalDurationMs);

        // Display initial calculation
        initialMonthsSpan.textContent = duration.totalMonths; // Show total breakdown for initial view
        initialWeeksSpan.textContent = duration.totalWeeks;
        initialDaysSpan.textContent = duration.totalDays;
        initialHoursSpan.textContent = duration.totalHours;
        initialMinutesSpan.textContent = duration.totalMinutes;
        initialSecondsSpan.textContent = duration.totalSeconds;

        initialDurationSection.style.display = 'block';
        countdownDisplaySection.style.display = 'none'; // Hide live display
        showStatusMessage(""); // Clear status message

        // Store dates for potential start
        localStorage.setItem('startDate', initialStartDate.toISOString());
        localStorage.setItem('endDate', targetEndDate.toISOString());
        localStorage.setItem('countdownActive', 'false'); // Not active yet

        setButtonStates(false, true); // Not counting, but is calculated
        return true; // Indicate success
    };

    const startCountdown = () => {
        // Ensure dates are loaded from storage or inputs if recalculated
        const storedStartDateStr = localStorage.getItem('startDate');
        const storedEndDateStr = localStorage.getItem('endDate');

        if (!storedStartDateStr || !storedEndDateStr) {
             showStatusMessage("Cannot start. Dates not found. Please calculate first.", true);
             return;
        }

        initialStartDate = new Date(storedStartDateStr);
        targetEndDate = new Date(storedEndDateStr);

        if (isNaN(initialStartDate.getTime()) || isNaN(targetEndDate.getTime())) {
             showStatusMessage("Stored dates are invalid. Please reset and recalculate.", true);
             resetCountdown(); // Clear invalid state
             return;
        }

        if (targetEndDate <= new Date()) {
            showStatusMessage("Cannot start. End date is in the past. Please select a future end date.", true);
            // Optionally, show the finished state immediately
            initialDurationSection.style.display = 'none';
            countdownDisplaySection.style.display = 'flex';
            const elapsedMs = new Date().getTime() - initialStartDate.getTime();
            const remainingMs = targetEndDate.getTime() - new Date().getTime();
            updateDisplay(elapsedMs, remainingMs); // Will show finished state
            setButtonStates(false, true); // Not counting, is calculated
            completeTimerBtn.disabled = true;
            return;
        }

        if (countdownInterval) {
            clearInterval(countdownInterval); // Clear any existing interval
        }

        localStorage.setItem('countdownActive', 'true');
        setButtonStates(true, true); // Is counting, is calculated
        initialDurationSection.style.display = 'none'; // Hide initial calculation
        countdownDisplaySection.style.display = 'flex'; // Show live display sections

        // Initial display update before interval starts
        const tick = () => {
            const now = new Date().getTime();
            // Ensure targetEndDate is still valid (might be cleared by reset)
            if (!targetEndDate || isNaN(targetEndDate.getTime())) {
                 clearInterval(countdownInterval);
                 countdownInterval = null;
                 console.warn("Target end date became invalid during countdown.");
                 // Optionally reset or show an error state
                 resetCountdown();
                 showStatusMessage("Countdown stopped due to invalid date.", true);
                 return;
             }
            const elapsedMs = now - initialStartDate.getTime();
            const remainingMs = targetEndDate.getTime() - now;
            updateDisplay(elapsedMs, remainingMs);
        };

        tick(); // Run once immediately
        countdownInterval = setInterval(tick, 1000);
    };

    const completeCountdown = () => {
        if (countdownInterval) {
            clearInterval(countdownInterval);
            countdownInterval = null;
        }

        localStorage.setItem('countdownActive', 'false');
        setButtonStates(false, true); // Not counting, but calculated state remains

        // Calculate final remaining time
        const now = new Date().getTime();
        let finalRemainingMs = 0;
        let elapsedMs = 0;
        if (targetEndDate && initialStartDate && !isNaN(targetEndDate.getTime()) && !isNaN(initialStartDate.getTime())) {
             finalRemainingMs = targetEndDate.getTime() - now;
             elapsedMs = now - initialStartDate.getTime();
        }

        // Update display one last time with the stopped values
        updateDisplay(elapsedMs, finalRemainingMs);

        showStatusMessage(`Countdown stopped manually. ${finalRemainingMs > 0 ? 'Time left shown.' : 'Target time passed.'}`, false);
        countdownMessage.style.color = 'var(--secondary-accent)';
        completeTimerBtn.disabled = true; // Disable complete after clicking
        startTimerBtn.disabled = false; // Allow restarting if needed before reset
    };

    const resetCountdown = () => {
        if (countdownInterval) {
            clearInterval(countdownInterval);
            countdownInterval = null;
        }

        // Clear state variables
        initialStartDate = null;
        targetEndDate = null;

        // Clear localStorage
        localStorage.removeItem('startDate');
        localStorage.removeItem('endDate');
        localStorage.removeItem('countdownActive');

        // Clear inputs
        startDateInput.value = '';
        endDateInput.value = '';

        // Hide displays
        initialDurationSection.style.display = 'none';
        countdownDisplaySection.style.display = 'none';
        showStatusMessage(""); // Clear status message

        // Reset all display spans to initial values
        const spansToReset = document.querySelectorAll('.duration-display span[id], .live-display span[id]');
        spansToReset.forEach(span => {
            // Check if it's a time component needing '00' or just '0'
            if (span.id.includes('hours') || span.id.includes('minutes') || span.id.includes('seconds') || span.id.includes('days-lg')) {
                 span.textContent = '00';
            } else {
                 span.textContent = '0';
            }
        });

        // Reset button states to initial
        setButtonStates(false, false); // Not counting, not calculated
    };

    // Function to display status/error messages
    const showStatusMessage = (message, isError = false) => {
        countdownMessage.textContent = message;
        countdownMessage.style.color = isError ? 'var(--error-color)' : 'var(--tertiary-accent)';
        // Hide message after a delay if it's an error/warning
        if (message) {
            setTimeout(() => {
                // Only clear if the message hasn't changed (e.g., by countdown finishing)
                if (countdownMessage.textContent === message) {
                   // Don't clear if countdown is running or finished naturally
                   const isActive = localStorage.getItem('countdownActive') === 'true';
                   if (!isActive && countdownMessage.textContent !== "Countdown Finished!") {
                       countdownMessage.textContent = '';
                   }
                }
            }, 4000); // Hide after 4 seconds
        }
    };


    // --- Event Listeners ---
    startTodayBtn.addEventListener('click', () => {
        startDateInput.value = formatDateTimeLocal(new Date());
    });

    endTodayBtn.addEventListener('click', () => {
        endDateInput.value = formatDateTimeLocal(new Date());
    });

    calculateBtn.addEventListener('click', calculateInitialDuration);
    startTimerBtn.addEventListener('click', startCountdown);
    completeTimerBtn.addEventListener('click', completeCountdown);
    resetTimerBtn.addEventListener('click', resetCountdown);

    // --- Initialization on Load ---
    const loadState = () => {
        const storedStartDateStr = localStorage.getItem('startDate');
        const storedEndDateStr = localStorage.getItem('endDate');
        const isCounting = localStorage.getItem('countdownActive') === 'true';

        let shouldStartImmediately = false;
        let wasCalculated = false;

        if (storedStartDateStr && storedEndDateStr) {
            initialStartDate = new Date(storedStartDateStr);
            targetEndDate = new Date(storedEndDateStr);

            if (!isNaN(initialStartDate.getTime()) && !isNaN(targetEndDate.getTime())) {
                 // Restore input values visually
                 startDateInput.value = formatDateTimeLocal(initialStartDate);
                 endDateInput.value = formatDateTimeLocal(targetEndDate);
                 wasCalculated = true; // Dates are valid, so it was calculated

                 // If it was counting, check if it should resume
                 if (isCounting) {
                     if (targetEndDate.getTime() > new Date().getTime()) {
                         // End date is still in the future, resume counting
                         shouldStartImmediately = true;
                     } else {
                         // Countdown finished while page was closed
                         localStorage.setItem('countdownActive', 'false'); // Update status
                         initialDurationSection.style.display = 'none';
                         countdownDisplaySection.style.display = 'flex';
                         const elapsedMs = targetEndDate.getTime() - initialStartDate.getTime(); // Total duration elapsed
                         updateDisplay(elapsedMs, 0); // Show final state (0 remaining)
                         showStatusMessage("Countdown finished while you were away.", false);
                         setButtonStates(false, true); // Not counting, is calculated
                         completeTimerBtn.disabled = true;
                     }
                 } else {
                     // Dates exist but wasn't counting, show initial calculation state
                     calculateInitialDuration(); // Recalculate and show initial duration section
                     setButtonStates(false, true); // Not counting, is calculated
                 }
            } else {
                // Invalid dates in storage, clear them
                console.warn("Invalid dates found in localStorage. Resetting.");
                resetCountdown();
            }
        } else {
             // No stored dates, initial state
             resetCountdown(); // Ensure clean state
        }

        if (shouldStartImmediately) {
            startCountdown(); // Start the countdown immediately
        } else if (!isCounting && !wasCalculated) {
            // If nothing loaded and not counting, ensure initial button state
            resetCountdown();
        }
    };

    loadState(); // Load state when the page loads
});

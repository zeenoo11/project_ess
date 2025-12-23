export class TimeManager {
    constructor() {
        this.date = new Date(2025, 0, 1, 0, 0); // Start from Jan 1st, 2025
        this.updateUI();
    }

    tick() {
        // 1 tick = 1 hour
        this.date.setHours(this.date.getHours() + 1);
        this.updateUI();
    }

    get hour() { return this.date.getHours(); }
    get day() { return this.date.getDate(); }
    get month() { return this.date.getMonth(); } // 0-indexed
    get year() { return this.date.getFullYear(); }

    formattedDate() {
        const options = {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', hour12: false
        };
        return this.date.toLocaleString('ko-KR', options);
    }

    updateUI() {
        const display = document.getElementById('time-display');
        if (display) {
            display.textContent = this.formattedDate();
        }
    }
}

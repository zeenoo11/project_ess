export class BatteryManager {
    constructor() {
        this.capacity = 150; // Starting capacity 150kWh
        this.chargeAmount = 50; // Current kWh: Starting with 50kWh
        this.totalCost = 50 * 0.10; // Assume initial charge cost is $0.10/kWh
        this.soh = 100; // State of Health (%)
        this.lifespanHours = 12 * 365 * 24; // 12 years in hours
        this.hoursPassed = 0;
        this.totalInvestment = this.capacity * 336.87; // Total cumulative cost
        this.updateUI();
    }

    upgradeCapacity(amount) {
        const cost = amount * 336.87;
        this.capacity += amount;
        this.totalInvestment += cost;
        this.updateUI();
    }

    tick() {
        // Degrade lifespan slightly every hour
        this.hoursPassed++;
        this.soh = Math.max(0, 100 * (1 - this.hoursPassed / this.lifespanHours));
        this.updateUI();
    }

    charge(amount, price) {
        // Adjust effective capacity by SoH
        const effectiveCapacity = this.capacity * (this.soh / 100);

        if (this.chargeAmount + amount > effectiveCapacity) {
            // Battery full or degraded capacity reached
            return false;
        }

        this.chargeAmount += amount;
        this.totalCost += amount * price;
        this.updateUI();
        return true;
    }

    discharge(amount) {
        if (this.chargeAmount - amount < 0) {
            return false;
        }

        // When discharging, we assume we use the "average" cost energy
        const avgPrice = this.getAveragePrice();
        this.chargeAmount -= amount;
        this.totalCost -= amount * avgPrice;

        // Safety check for tiny floating point errors
        if (this.chargeAmount <= 0) {
            this.chargeAmount = 0;
            this.totalCost = 0;
        }

        this.updateUI();
        return true;
    }

    getAveragePrice() {
        if (this.chargeAmount === 0) return 0;
        return this.totalCost / this.chargeAmount;
    }

    getInvestmentCost() {
        // Updated Price: $336.87 per kWh
        return this.capacity * 336.87;
    }

    updateUI() {
        const bar = document.getElementById('charge-bar');
        const sohBar = document.getElementById('soh-bar');
        const kwhText = document.getElementById('battery-kwh');
        const maxText = document.getElementById('max-capacity');
        const avgPriceText = document.getElementById('avg-price');
        const investmentText = document.getElementById('investment-cost');
        const sohText = document.getElementById('soh-value');

        if (bar) {
            const percentage = (this.chargeAmount / this.capacity) * 100;
            bar.style.width = `${percentage}%`;
        }
        if (sohBar) {
            sohBar.style.width = `${this.soh}%`;
        }
        if (kwhText) kwhText.textContent = this.chargeAmount.toFixed(1);
        if (maxText) maxText.textContent = this.capacity;
        if (avgPriceText) avgPriceText.textContent = this.getAveragePrice().toFixed(3);
        if (sohText) sohText.textContent = Math.round(this.soh);
        if (investmentText) {
            investmentText.textContent = (this.totalInvestment / 1000).toFixed(2);
        }
    }
}

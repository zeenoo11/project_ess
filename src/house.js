export class HouseManager {
    constructor() {
        // Monthly target: 300 kWh. 300 / 30 / 24 = 0.416 kWh per hour on average.
        this.baseRate = 0.4;
        this.history = []; // Stores { cost, energy, timestamp }
        this.usageHistory = []; // For graph: [usage, usage, ...]
        this.monthlyEnergy = 0;
        this.monthlyCost = 0;
        this.currentMonth = -1;
        this.updateUI();
    }

    consume(battery, marketPrice, timeManager) {
        const hour = timeManager.hour;
        const month = timeManager.month;

        // Reset monthly stats if month changed
        if (this.currentMonth !== month) {
            this.currentMonth = month;
            this.monthlyEnergy = 0;
            this.monthlyCost = 0;
        }

        // Variable consumption: Peak (17:00 ~ 22:00) uses ~2.5x more
        let multiplier = 1.0;
        if (hour >= 17 && hour <= 22) {
            multiplier = 2.5;
        } else if (hour >= 0 && hour <= 6) {
            multiplier = 0.5; // low usage at night
        }

        const hourlyUsage = this.baseRate * multiplier;
        let energyNeeded = hourlyUsage;
        let actualCost = 0;

        // Priority 1: Use Battery
        if (battery.chargeAmount > 0) {
            const energyFromBattery = Math.min(energyNeeded, battery.chargeAmount);
            const batteryAvgPrice = battery.getAveragePrice();

            battery.discharge(energyFromBattery);
            actualCost += energyFromBattery * batteryAvgPrice;
            energyNeeded -= energyFromBattery;
        }

        // Priority 2: Direct Market Usage
        if (energyNeeded > 0) {
            actualCost += energyNeeded * marketPrice;
        }

        // Track stats
        this.monthlyEnergy += hourlyUsage;
        this.monthlyCost += actualCost;

        // Keep history for graph (storing hour for X-axis)
        this.usageHistory.push({ usage: hourlyUsage, hour: hour });
        if (this.usageHistory.length > 50) this.usageHistory.shift();

        this.updateUI(hourlyUsage);
    }

    getMonthlyAverageCost() {
        return this.monthlyEnergy > 0 ? this.monthlyCost / this.monthlyEnergy : 0;
    }

    updateUI(currentUsage = 0) {
        const usageText = document.getElementById('house-usage');
        const avgCostText = document.getElementById('house-avg-cost');
        if (usageText) usageText.textContent = currentUsage.toFixed(2);
        if (avgCostText) {
            avgCostText.textContent = this.getMonthlyAverageCost().toFixed(3);
        }
        this.render();
    }

    render() {
        const canvas = document.getElementById('house-usage-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        const paddingBottom = 20;
        const chartHeight = height - paddingBottom;

        ctx.clearRect(0, 0, width, height);

        // Draw Grid and Labels
        ctx.strokeStyle = '#e2e8f0';
        ctx.setLineDash([2, 4]);
        ctx.lineWidth = 1;
        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px Outfit';
        ctx.textAlign = 'center';

        const step = width / 50;
        const maxUsage = 1.0;

        this.usageHistory.forEach((data, i) => {
            const x = i * step;

            // Vertical line every 6 hours or when hour is multiple of 6
            if (data.hour % 6 === 0 && (i === 0 || this.usageHistory[i - 1].hour !== data.hour)) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, chartHeight);
                ctx.stroke();

                ctx.fillText(`${data.hour}h`, x, height - 5);
            }
        });

        ctx.setLineDash([]); // Reset dash

        // Draw usage line
        ctx.beginPath();
        ctx.strokeStyle = '#f59e0b'; // Amber-500
        ctx.lineWidth = 2;

        this.usageHistory.forEach((data, i) => {
            const x = i * step;
            const y = chartHeight - (data.usage / maxUsage) * (chartHeight * 0.8) - 10;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.stroke();
    }
}

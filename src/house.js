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

        // Gradient consumption profile (0h to 23h)
        // Smooth transition: Low night -> Morning Ramp -> Day plateau -> Evening Peak -> Night Drop
        const hourlyProfile = [
            0.4, 0.4, 0.35, 0.35, 0.4, 0.5,  // 00-05: Deep night (Low)
            0.7, 1.0, 1.1, 1.0, 0.9, 0.9,    // 06-11: Morning ramp
            1.0, 1.1, 1.0, 1.1, 1.3, 1.6,    // 12-17: Afternoon & Pre-peak
            2.3, 2.5, 2.4, 1.8, 1.2, 0.7     // 18-23: Peak & Drop
        ];

        // Add small randomness to make it feel organic (+/- 10%)
        const baseMultiplier = hourlyProfile[hour] || 0.5;
        const noise = 0.9 + Math.random() * 0.2;
        const multiplier = baseMultiplier * noise;

        const hourlyUsage = this.baseRate * multiplier;
        let energyNeeded = hourlyUsage;
        let actualCost = 0;
        let marketEnergyUsed = 0;

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
            marketEnergyUsed = energyNeeded;
            actualCost += marketEnergyUsed * marketPrice;
        }

        // Track stats
        this.monthlyEnergy += hourlyUsage;
        this.monthlyCost += actualCost;

        // Keep history for graph (storing hour for X-axis)
        this.usageHistory.push({ usage: hourlyUsage, hour: hour });
        if (this.usageHistory.length > 50) this.usageHistory.shift();

        this.updateUI(hourlyUsage);

        return marketEnergyUsed;
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

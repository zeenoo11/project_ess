export class WalletManager {
    constructor(initialBalance = 1000) {
        this.balance = initialBalance;
        this.updateUI();
    }

    add(amount) {
        this.balance += amount;
        this.updateUI();
    }

    subtract(amount) {
        if (this.balance >= amount) {
            this.balance -= amount;
            this.updateUI();
            return true;
        }
        return false;
    }

    updateUI() {
        const balanceText = document.getElementById('balance-display');
        const goalBar = document.getElementById('goal-bar');
        const goalPercentText = document.getElementById('goal-percent');

        if (balanceText) {
            balanceText.textContent = this.balance.toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 2
            });
        }

        // Goal Update (Target: $5,000 Profit from $5,000 Initial)
        const initial = 5000;
        const targetProfit = 5000;
        // Calculate percentage of profit (clamped 0 to 100)
        const profit = Math.max(0, this.balance - initial);
        const percent = Math.min(100, (profit / targetProfit) * 100);

        if (goalBar) {
            goalBar.style.width = `${percent}%`;
        }
        if (goalPercentText) {
            goalPercentText.textContent = `${percent.toFixed(1)}%`;
        }
    }
}

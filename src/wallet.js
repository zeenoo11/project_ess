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
        if (balanceText) {
            balanceText.textContent = this.balance.toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 2
            });
        }
    }
}

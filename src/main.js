import Phaser from 'phaser';
import GameScene from './scenes/GameScene';
import { MarketSimulator } from './market';
import { BatteryManager } from './battery';
import { HouseManager } from './house';
import { TimeManager } from './time';
import { WalletManager } from './wallet';

const config = {
    type: Phaser.AUTO,
    width: 1000,
    height: 750,
    parent: 'game-container',
    transparent: true,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [GameScene],
    pixelArt: false,
    antialias: true
};

new Phaser.Game(config);

// App State
document.addEventListener('DOMContentLoaded', () => {
    const time = new TimeManager();
    const market = new MarketSimulator();
    const battery = new BatteryManager();
    const house = new HouseManager();
    const wallet = new WalletManager(5000); // Start with $5,000

    let autoBuyEnabled = false;
    let tradeAmount = 5; // Default trade volume
    let lastMonth = time.month;

    const autoBuyThresholdInput = document.getElementById('auto-buy-price');
    const autoBuyToggle = document.getElementById('auto-buy-toggle');
    const buyBtn = document.getElementById('buy-btn');
    const sellBtn = document.getElementById('sell-btn');

    market.start();

    // Trade Amount Selection
    document.querySelectorAll('.amt-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.amt-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            tradeAmount = parseInt(btn.dataset.amt);

            // Update labels
            buyBtn.textContent = `BUY (${tradeAmount}kWh)`;
            sellBtn.textContent = `SELL (${tradeAmount}kWh)`;
        });
    });

    // Core Game Loop for simulation (2s = 1h tick as requested)
    setInterval(() => {
        time.tick();
        battery.tick();
        market.update(time); // Pass time for SMP lookup
        const marketEnergyUsed = house.consume(battery, market.currentPrice, time);
        if (marketEnergyUsed > 0) {
            wallet.subtract(marketEnergyUsed * market.currentPrice);
        }

        // Salary Logic: Monthly $200
        if (time.month !== lastMonth) {
            wallet.add(200);
            lastMonth = time.month;
            console.log("Monthly salary received: $200");
        }

        // Auto-buy logic (Hourly check)
        if (autoBuyEnabled) {
            const threshold = parseFloat(autoBuyThresholdInput.value);
            if (market.currentPrice <= threshold) {
                if (wallet.subtract(market.currentPrice)) {
                    battery.charge(1, market.currentPrice);
                }
            }
        }
    }, 2000);

    // Auto-buy slider display update
    autoBuyThresholdInput.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value).toFixed(3);
        document.getElementById('auto-buy-val').textContent = val;
    });

    // Manual Trade Listeners (Dynamic tradeAmount)
    buyBtn.addEventListener('click', () => {
        const totalCost = tradeAmount * market.currentPrice;
        if (wallet.subtract(totalCost)) {
            battery.charge(tradeAmount, market.currentPrice);
        } else {
            console.warn("Insufficient funds!");
        }
    });

    sellBtn.addEventListener('click', () => {
        if (battery.discharge(tradeAmount)) {
            wallet.add(tradeAmount * market.currentPrice);
        }
    });

    // Advanced Feature Listeners
    document.getElementById('upgrade-capacity').addEventListener('click', () => {
        const upgradeAmount = 50;
        const upgradeCost = upgradeAmount * 336.87; // Cost for 50kWh
        if (wallet.subtract(upgradeCost)) {
            battery.upgradeCapacity(upgradeAmount);
            console.log('Battery upgraded to:', battery.capacity, 'kWh');
        } else {
            console.warn("Insufficient funds for upgrade!");
        }
    });

    autoBuyToggle.addEventListener('click', () => {
        autoBuyEnabled = !autoBuyEnabled;
        autoBuyToggle.textContent = autoBuyEnabled ? 'ON' : 'OFF';
        autoBuyToggle.style.backgroundColor = autoBuyEnabled ? '#22c55e' : '#e2e8f0';
        autoBuyToggle.style.color = autoBuyEnabled ? 'white' : '#475569';
    });
});

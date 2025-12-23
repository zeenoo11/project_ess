# Project ESS (Energy Storage System)

A high-performance, real-time energy management simulation game built with **Phaser 3**, **Vite**, and modern Web technologies.

## 🚀 Overview

Project ESS is a smart grid simulation where players manage a household's energy needs using an Energy Storage System (ESS). Monitor market prices, trade energy, and optimize your battery usage to save money and maintain a sustainable energy cycle.

### Key Features
- **Dynamic Energy Market**: Real-time fluctuating electricity prices (SMP) based on demand patterns.
- **Smart Household Simulation**: Intelligent consumption modeling with visualization graphs.
- **Battery Management**: Monitor Charge level (SoC) and State of Health (SoH) to maximize efficiency.
- **Auto-Trading System**: Automated buying logic based on user-defined price thresholds.
- **Premium UI/UX**: Glassmorphism design, smooth animations, and responsive layouts.

## 🛠 Tech Stack

- **Engine**: [Phaser 3](https://phaser.io/)
- **Bundler**: [Vite 6](https://vitejs.dev/)
- **Logic**: Vanilla JavaScript (ES6+)
- **Styling**: Vanilla CSS with modern Flexbox/Grid and Google Fonts (Outfit)

## 📦 Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/zeenoo11/project_ess.git
   cd project_ess
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run development server**:
   ```bash
   npm run dev
   ```

4. **Build for production**:
   ```bash
   npm run build
   ```

## 🎮 How to Play

1. **Monitor Household Usage**: The household consumes electricity hourly. Ensure the battery has enough charge.
2. **Buy Low, Sell High**: Use the Energy Market card to track prices. Buy when prices are cheap and store energy.
3. **Automate**: Turn on "Auto-buy" and set a threshold to automatically purchase energy when the market price drops.
4. **Upgrade**: Reinvest your savings to increase battery capacity for better storage efficiency.

## 📄 License

This project is licensed under the ISC License.

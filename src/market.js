export class MarketSimulator {
    constructor() {
        this.history = [];
        this.currentPrice = 0.10; // USD per kWh
        this.smpData = {}; // Stores loaded SMP data: { "M_D_H": price }
        this.canvas = document.getElementById('price-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.setupCanvas();
        this.loadSmpData();
    }

    async loadSmpData() {
        try {
            const response = await fetch('./smp_data.csv');
            const text = await response.text();
            const rows = text.split('\n').slice(1); // Skip header

            rows.forEach(row => {
                if (!row.trim()) return;
                const [month, day, hour, smp] = row.split(',');
                // Store in cents/kWh or USD/kWh?
                // The CSV has KRW/kWh (~100-150).
                // 1 KRW ~ 0.00075 USD. 100 KRW ~ 0.075 USD.
                // Let's convert to USD for consistency with existing app ($0.10 range)
                const priceUniteUSD = parseFloat(smp) * 0.00075;
                const key = `${parseInt(month)}_${parseInt(day)}_${parseInt(hour)}`;
                this.smpData[key] = priceUniteUSD;
            });
            // SMP Data Loaded
        } catch (error) {
            console.error("Failed to load SMP data:", error);
        }
    }

    setupCanvas() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.canvas.width = this.canvas.parentElement.clientWidth;
        this.canvas.height = this.canvas.parentElement.clientHeight;
    }

    update(timeManager) {
        if (!timeManager) return;

        const { month, day, hour } = timeManager;
        // TimeManager returns 0-indexed month (0=Jan), but CSV data relies on 1-indexed month (1=Jan).
        const key = `${month + 1}_${day}_${hour}`;

        if (this.smpData[key]) {
            this.currentPrice = this.smpData[key];
        } else {
            console.warn(`No SMP data for ${key}. Current keys example: ${Object.keys(this.smpData)[0]}`);
        }

        this.history.push(this.currentPrice);
        if (this.history.length > 24) this.history.shift(); // Keep last 24h for graph

        document.getElementById('current-price').textContent = this.currentPrice.toFixed(3);
        this.render();
    }

    render() {
        const { width, height } = this.canvas;
        // Adjust range dynamically or keep fixed? 
        // KRW 100-200 -> USD 0.075 - 0.15
        const minPrice = 0.05;
        const maxPrice = 0.20; // Increased max for safety
        const range = maxPrice - minPrice;

        this.ctx.clearRect(0, 0, width, height);

        // Draw grid
        this.ctx.strokeStyle = '#e2e8f0';
        this.ctx.lineWidth = 1;
        for (let i = 0; i <= 4; i++) {
            const y = (height / 4) * i;
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(width, y);
            this.ctx.stroke();
        }

        // Draw price line
        this.ctx.beginPath();
        this.ctx.strokeStyle = '#0284c7';
        this.ctx.lineWidth = 3;
        this.ctx.lineJoin = 'round';

        if (this.history.length > 1) {
            const step = width / (this.history.length - 1);
            this.history.forEach((price, i) => {
                const x = i * step;
                const y = height - ((price - minPrice) / range) * height;
                if (i === 0) this.ctx.moveTo(x, y);
                else this.ctx.lineTo(x, y);
            });
            this.ctx.stroke();

            // Area under the line
            this.ctx.lineTo(width, height);
            this.ctx.lineTo(0, height);
            this.ctx.fillStyle = 'rgba(2, 132, 199, 0.05)';
            this.ctx.fill();
        }
    }

    start() {
        // Market price now ticks via main simulation loop every 2 seconds
        // setInterval(() => this.update(), 2000);
    }
}

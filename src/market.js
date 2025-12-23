export class MarketSimulator {
    constructor() {
        this.history = [];
        this.currentPrice = 0.10; // USD per kWh
        this.canvas = document.getElementById('price-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.setupCanvas();
    }

    setupCanvas() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.canvas.width = this.canvas.parentElement.clientWidth;
        this.canvas.height = this.canvas.parentElement.clientHeight;
    }

    update() {
        // Price Range: 0.05 ~ 0.15 USD
        const minPrice = 0.05;
        const maxPrice = 0.15;

        // Slightly more subtle random walk for hourly ticks
        const change = (Math.random() - 0.5) * 0.01;
        this.currentPrice = Math.max(minPrice, Math.min(maxPrice, this.currentPrice + change));
        this.history.push(this.currentPrice);
        if (this.history.length > 100) this.history.shift();

        document.getElementById('current-price').textContent = this.currentPrice.toFixed(3);
        this.render();
    }

    render() {
        const { width, height } = this.canvas;
        const minPrice = 0.05;
        const maxPrice = 0.15;
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

    start() {
        // Market price now ticks via main simulation loop every 2 seconds
        // setInterval(() => this.update(), 2000);
    }
}

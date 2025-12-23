
const fs = require('fs');
const path = require('path');

// Monthly average SMP for 2024 (Mainland) - researched values
const monthlyAverages = {
    1: 120.39, 2: 118.46, 3: 117.39,
    4: 117.40, 5: 114.06, 6: 112.90,
    7: 112.91, 8: 101.16, 9: 101.53,
    10: 101.53, 11: 116.05, 12: 105.57
};

// Daily load profile multipliers (0-23 hours)
const dailyProfile = [
    0.85, 0.80, 0.78, 0.78, 0.80, 0.85, // 00-05
    0.95, 1.05, 1.15, 1.20, 1.20, 1.15, // 06-11
    1.10, 1.05, 1.05, 1.10, 1.20, 1.25, // 12-17
    1.25, 1.20, 1.15, 1.10, 1.00, 0.90  // 18-23
];

function generateSmpData() {
    const filename = path.join(__dirname, 'smp_data.csv');
    const header = 'Month,Day,Hour,SMP\n';
    let content = header;

    for (let month = 1; month <= 12; month++) {
        const avgPrice = monthlyAverages[month];
        // Days in month for 2024 (Leap year)
        const daysInMonth = new Date(2024, month, 0).getDate();

        for (let day = 1; day <= daysInMonth; day++) {
            // Daily random variance +/- 5%
            const dailyBase = avgPrice * (0.95 + Math.random() * 0.10);

            for (let hour = 0; hour < 24; hour++) {
                const profileFactor = dailyProfile[hour];
                // Hourly noise +/- 2%
                const noise = 0.98 + Math.random() * 0.04;
                const finalSmp = (dailyBase * profileFactor * noise).toFixed(2);

                content += `${month},${day},${hour},${finalSmp}\n`;
            }
        }
    }

    fs.writeFile(filename, content, (err) => {
        if (err) {
            console.error('Error writing file:', err);
        } else {
            console.log('Done generating smp_data.csv');
        }
    });
}

generateSmpData();

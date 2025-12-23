
import csv
import random
import calendar

# Monthly average SMP for 2024 (Mainland) - researched values
monthly_averages = {
    1: 120.39, 2: 118.46, 3: 117.39,
    4: 117.40, 5: 114.06, 6: 112.90,
    7: 112.91, 8: 101.16, 9: 101.53,
    10: 101.53, 11: 116.05, 12: 105.57
}

# Daily load profile multipliers (approximate) to simulate peak/off-peak
# 0-23 hours
daily_profile = [
    0.85, 0.80, 0.78, 0.78, 0.80, 0.85, # 00-05: Off-peak
    0.95, 1.05, 1.15, 1.20, 1.20, 1.15, # 06-11: Morning ramp & peak
    1.10, 1.05, 1.05, 1.10, 1.20, 1.25, # 12-17: Afternoon dip & evening ramp
    1.25, 1.20, 1.15, 1.10, 1.00, 0.90  # 18-23: Evening peak & drop
]

def generate_smp_data(filename="smp_data.csv"):
    with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
        fieldnames = ['Month', 'Day', 'Hour', 'SMP']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()

        for month in range(1, 13):
            avg_price = monthly_averages[month]
            # Get number of days in the month for year 2024
            _, num_days = calendar.monthrange(2024, month)
            
            for day in range(1, num_days + 1):
                # Add some daily random variance (+/- 5%) to base average
                daily_base = avg_price * random.uniform(0.95, 1.05)
                
                for hour in range(24):
                    # Apply hourly profile
                    profile_factor = daily_profile[hour]
                    # Add small hourly random noise (+/- 2%)
                    noise = random.uniform(0.98, 1.02)
                    
                    final_smp = daily_base * profile_factor * noise
                    
                    writer.writerow({
                        'Month': month,
                        'Day': day,
                        'Hour': hour,
                        'SMP': round(final_smp, 2)
                    })

if __name__ == "__main__":
    generate_smp_data(r"C:\JW\Research Docs\Games\project_ess\smp_data.csv")
    print("Done generating smp_data.csv")

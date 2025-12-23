
import csv
import random
import calendar
import os

# Monthly average consumption (kWh) for South Korean household
# Based on research: 2024 Aug peak ~363kWh, Annual avg ~275kWh
# Winter (Dec-Feb) and Summer (Jul-Aug) are peaks.
monthly_averages = {
    1: 290, 2: 285, 3: 260,
    4: 255, 5: 260, 6: 280,
    7: 320, 8: 363, 9: 290,
    10: 255, 11: 265, 12: 295
}

# Daily load profile multipliers (approximate) - Residential
# Normalized so average ~ 1.0
daily_profile = [
    0.60, 0.55, 0.50, 0.50, 0.55, 0.65, # 00-05: Deep sleep
    0.80, 1.10, 1.00, 0.90, 0.85, 0.85, # 06-11: Morning routine, then work/school
    0.85, 0.85, 0.90, 0.95, 1.05, 1.20, # 12-17: Afternoon low, building up
    1.35, 1.45, 1.40, 1.30, 1.10, 0.80  # 18-23: Evening peak (dinner, TV, etc)
]

# Normalize profile to ensure sum is 24 (average 1.0 per hour)
profile_sum = sum(daily_profile)
daily_profile = [x / profile_sum * 24 for x in daily_profile]

def generate_household_data(filename="public/household_consumption.csv"):
    # Ensure public directory exists
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    
    with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
        fieldnames = ['Month', 'Day', 'Hour', 'Consumption_kWh']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()

        for month in range(1, 13):
            avg_monthly_total = monthly_averages[month]
            # Get number of days in the month for year 2024
            _, num_days = calendar.monthrange(2024, month)
            
            # Average daily consumption for this month
            avg_daily_total = avg_monthly_total / num_days
            
            # Average hourly consumption for this month
            avg_hourly_base = avg_daily_total / 24.0

            for day in range(1, num_days + 1):
                # Daily variance (e.g. weekends vs weekdays, weather) +/- 10%
                daily_variance = random.uniform(0.9, 1.1)
                
                for hour in range(24):
                    # Apply hourly profile
                    profile_factor = daily_profile[hour]
                    # Hourly noise/randomness +/- 5%
                    noise = random.uniform(0.95, 1.05)
                    
                    consumption = avg_hourly_base * profile_factor * daily_variance * noise
                    
                    writer.writerow({
                        'Month': month,
                        'Day': day,
                        'Hour': hour,
                        'Consumption_kWh': round(consumption, 4)
                    })

if __name__ == "__main__":
    output_path = os.path.join(os.getcwd(), "public", "household_consumption.csv")
    print(f"Generating data to: {output_path}")
    generate_household_data(output_path)
    print("Done.")

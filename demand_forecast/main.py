import pandas as pd
import numpy as np
import joblib
import matplotlib.pyplot as plt
import base64
from sklearn.linear_model import LinearRegression

# Load models and dataset
MODEL_PATH = "/content/(3)demand_forecasting_model.pkl"
model = joblib.load(MODEL_PATH)

df = pd.read_csv("/content/demand_forecasting_updated.csv")

# Define warehouse zones and capacities
ZONE_CAPACITIES = [1000, 2000, 3000, 1000, 7000]
ZONE_LABELS = ['Z1', 'Z2', 'Z3', 'Z4', 'Z5']

# Function to allocate products to warehouse zones based on demand
def allocate_products_to_zones(df_new):
    high_demand_products = df_new.groupby(['Location', 'Product_ID'])['Sales_Volume'].sum().reset_index()
    high_demand_products = high_demand_products.sort_values(by=['Location', 'Sales_Volume'], ascending=[True, False])
    
    allocation = {}
    for location, products in high_demand_products.groupby('Location'):
        allocation[location] = {}
        remaining_capacity = ZONE_CAPACITIES.copy()

        for _, row in products.iterrows():
            product = row['Product_ID']
            assigned = False

            for zone, capacity in zip(ZONE_LABELS, remaining_capacity):
                if capacity >= row['Sales_Volume']:
                    if zone not in allocation[location]:
                        allocation[location][zone] = []
                    allocation[location][zone].append(product)
                    remaining_capacity[ZONE_LABELS.index(zone)] -= row['Sales_Volume']
                    assigned = True
                    break

            if not assigned:
                max_zone = ZONE_LABELS[np.argmax(remaining_capacity)]
                if max_zone not in allocation[location]:
                    allocation[location][max_zone] = []
                allocation[location][max_zone].append(product)
                remaining_capacity[np.argmax(remaining_capacity)] -= row['Sales_Volume']
    
    return allocation

# Preprocess data for forecasting
month_map = {month: i for i, month in enumerate([
    "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"], start=1)}
df['Time_of_Purchase'] = df['Time_of_Purchase'].map(month_map)
df['Time_of_Purchase'] = pd.to_datetime(df['Time_of_Purchase'].astype(str) + "-2024", format="%m-%Y")
df['Month'] = df['Time_of_Purchase'].dt.to_period('M')

# Function to forecast product sales using Linear Regression
def forecast_sales(product_id, months=6):
    product_sales = df[df['Product_ID'] == product_id].groupby('Month')['Sales_Volume'].sum()

    if len(product_sales) < 2:
        return {"error": f"Not enough historical data for Product {product_id}"}

    product_sales = product_sales.reset_index()
    product_sales['Month_Num'] = range(1, len(product_sales) + 1)

    X = product_sales[['Month_Num']]
    y = product_sales['Sales_Volume']

    model = LinearRegression()
    model.fit(X, y)

    future_months = np.arange(len(product_sales) + 1, len(product_sales) + 1 + months).reshape(-1, 1)
    future_sales = model.predict(future_months)


    # Generate chart
    plt.figure(figsize=(10, 5))
    plt.plot(X, model.predict(X), label='Trend Line', linestyle='dashed', color='green')
    plt.plot(future_months, future_sales, label='Forecasted Sales', linestyle='dashed', color='red')
    plt.xlabel('Month')
    plt.ylabel('Sales Volume')
    plt.title(f'Sales Forecast for Product {product_id}')
    plt.legend()

    # Save the image
    image_path = f"/content/{product_id}_forecast.png"
    plt.savefig(image_path)
    plt.close()

    # Convert image to base64
    with open(image_path, "rb") as img_file:
        img_base64 = base64.b64encode(img_file.read()).decode('utf-8')

    return {"forecast": future_sales.tolist(), "chart_path": image_path, "chart_base64": img_base64}

# Example Usage:
df_new = pd.read_csv("/content/demand_forecasting_updated.csv")
zone_allocation = allocate_products_to_zones(df_new)
print("Zone Allocation:", zone_allocation)

product_id = "P1"
forecast_result = forecast_sales(product_id, months=6)
print("Forecast Result:", forecast_result)
# Save trained model

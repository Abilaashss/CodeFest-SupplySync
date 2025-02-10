import folium
from folium.plugins import HeatMap
import pandas as pd
import numpy as np
import plotly.express as px
import dash
from dash import dcc, html
from dash.dependencies import Input, Output

# Coordinates for South India (approximate bounding box)
south_india_coords = [12.0, 76.0]

# Warehouse and Supplier Locations (example coordinates)
warehouse_locations = {
    "Warehouse 1": [13.0827, 80.2707],  # Chennai
    "Warehouse 2": [12.9716, 77.5946],  # Bangalore
    "Warehouse 3": [9.9312, 76.2673],   # Kochi
    "Warehouse 4": [17.3850, 78.4867]   # Hyderabad
}

supplier_locations = {
    "Supplier 1": [11.0168, 76.9558],  # Coimbatore
    "Supplier 2": [8.0883, 77.5385]    # Kanyakumari
}

# Dummy demand data for products around warehouses
def generate_demand_data(warehouse_coords, product):
    np.random.seed(42)
    num_points = 100
    lats = np.random.normal(warehouse_coords[0], 0.2, num_points)
    lons = np.random.normal(warehouse_coords[1], 0.2, num_points)
    demand = np.random.randint(1, 100, num_points)
    return pd.DataFrame({
        "latitude": lats,
        "longitude": lons,
        "demand": demand,
        "product": product
    })

# Combine demand data for all warehouses and products
products = ["wheels", "doors", "headlight"]
demand_data = pd.concat([
    generate_demand_data(warehouse_locations[wh], product)
    for wh in warehouse_locations
    for product in products
])

# Initialize Dash app
app = dash.Dash(__name__)

app.layout = html.Div([
    html.H1("South India Demand Heatmap", style={
        'textAlign': 'center',
        'color': '#2a3f5f',
        'padding': '20px',
        'marginBottom': '10px',
        'fontFamily': 'Arial, sans-serif'
    }),
    html.Div([
        dcc.Dropdown(
            id="product-dropdown",
            options=[{"label": product.title(), "value": product} for product in products],
            value="wheels",
            clearable=False,
            style={
                'width': '50%',
                'margin': '0 auto',
                'paddingBottom': '20px',
                'borderRadius': '8px',
                'boxShadow': '0 2px 4px rgba(0,0,0,0.1)'
            }
        ),
    ]),
    dcc.Graph(id="heatmap-graph", style={
        'height': '85vh',
        'width': '98%',
        'margin': '0 auto',
        'paddingRight': '20px'  # Added right padding
    })
], style={
    'backgroundColor': '#f9f9f9',
    'height': '100vh',
    'overflow': 'hidden'  # Prevent scrollbars
})

@app.callback(
    Output("heatmap-graph", "figure"),
    [Input("product-dropdown", "value")]
)
def update_heatmap(selected_product):
    filtered_data = demand_data[demand_data["product"] == selected_product]
    
    # Configure visualization parameters based on product
    vis_config = {
        "wheels": {
            "map_style": "carto-positron",
            "radius": 20,
            "color_scale": [[0, "rgba(0,0,0,0)"], [0.2, "yellow"], [0.5, "orange"], [1.0, "red"]],
            "symbol": "circle"
        },
        "doors": {
            "map_style": "stamen-terrain",
            "radius": 30,
            "color_scale": [[0, "rgba(0,0,0,0)"], [0.1, "blue"], [0.5, "purple"], [1.0, "magenta"]],
            "symbol": "square"
        },
        "headlight": {
            "map_style": "open-street-map",
            "radius": 25,
            "color_scale": [[0, "rgba(0,0,0,0)"], [0.3, "green"], [0.6, "lime"], [1.0, "yellow"]],
            "symbol": "diamond"
        }
    }
    
    config = vis_config[selected_product]
    
    fig = px.density_mapbox(
        filtered_data,
        lat="latitude",
        lon="longitude",
        z="demand",
        radius=config["radius"],
        center=dict(lat=12.0, lon=78.0),
        zoom=5.2,
        mapbox_style=config["map_style"],
        color_continuous_scale=config["color_scale"],
        range_color=[0, 100],
        title=f"Demand Heatmap for {selected_product.title()}",
        height=800,
        width=1600
    )
    
    # Modify marker symbols based on product
    for name, coords in warehouse_locations.items():
        fig.add_scattermapbox(
            lat=[coords[0]],
            lon=[coords[1]],
            mode="markers+text",
            marker=dict(
                size=14,
                color="#0047AB",
                symbol=config["symbol"]  # Use product-specific symbol
            ),
            text=[name],
            textposition="bottom right",
            textfont=dict(size=12, color="#0047AB")
        )
    
    # Add supplier locations with improved markers
    for name, coords in supplier_locations.items():
        fig.add_scattermapbox(
            lat=[coords[0]],
            lon=[coords[1]],
            mode="markers+text",
            marker=dict(size=14, color="#228B22", symbol="marker"),
            text=[name],
            textposition="bottom right",
            textfont=dict(size=12, color="#228B22")
        )
    
    fig.update_layout(
        margin={"r":150, "t":80, "l":100, "b":40},  # Increased right margin
        coloraxis_colorbar=dict(
            title="Demand Level",
            tickvals=[0, 50, 100],
            ticktext=["Low", "Medium", "High"],
            x=0.95,  # Move colorbar closer to edge
            xanchor='left',  # Anchor to left side of colorbar
            y=0.5,
            yanchor='middle',
            thickness=20,  # Thicker colorbar
            len=0.6,  # Shorter colorbar
            title_side="right",
            tickfont=dict(size=12)
        ),
        title_font_size=24,
        title_x=0.5,
        mapbox=dict(accesstoken="your_mapbox_token"),
        paper_bgcolor='#f9f9f9',
        plot_bgcolor='#f9f9f9',
        autosize=True  # Enable auto-sizing
    )
    
    # Add region bounding box
    fig.update_mapboxes(
        bounds=dict(
            west=76.0,  # Minimum longitude
            east=80.5,  # Maximum longitude
            south=8.0,  # Minimum latitude
            north=17.5  # Maximum latitude
        )
    )
    
    return fig

if __name__ == "__main__":
    app.run_server(debug=True)
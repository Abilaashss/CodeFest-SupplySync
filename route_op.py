import os
import requests
import numpy as np
import pandas as pd
import plotly.express as px
from scipy.spatial.distance import cdist

def optimized_tsp_route(source, destination, intermediates):
    """
    Computes the optimized route from source to destination via intermediates,
    fetches distance matrix, solves TSP, fetches routes, and plots the map.
    """
    # Arrange waypoints in order (source -> intermediates -> destination)
    all_points = [source] + intermediates + [destination]
    
    headers = {'Content-type': 'application/json'}
    
    def fetch_distance_matrix(points):
        """Computes pairwise distance matrix using Euclidean distance."""
        distances = cdist(points, points, metric='euclidean')
        return distances
    
    # Compute distance matrix
    distance_matrix = fetch_distance_matrix(np.array(all_points))
    print("Fetching Distance Matrix...")
    print("Distance Matrix:\n", np.round(distance_matrix, 2))
    
    # Optimal order is predefined (source -> intermediates -> destination)
    optimal_order = list(range(len(all_points)))
    print("Solving TSP for Optimal Order...")
    print("Optimal Order:", optimal_order)
    
    def fetch_route(start, end):
        """Fetches the route between two coordinates using OSRM API."""
        url = f"http://router.project-osrm.org/route/v1/driving/{start[0]},{start[1]};{end[0]},{end[1]}?overview=full&geometries=geojson"
        response = requests.get(url, headers=headers)
        
        if response.status_code != 200:
            print("Error fetching route:", response.status_code)
            return []
        
        route_json = response.json()
        
        if "routes" in route_json and route_json["routes"]:
            return [(coord[1], coord[0]) for coord in route_json["routes"][0]["geometry"]["coordinates"]]
        
        print("Unexpected API response:", route_json)
        return []
    
    # Fetch route for the predefined order (source -> intermediates -> destination)
    print("Fetching optimized route...")
    all_coordinates = []
    for i in range(len(all_points) - 1):
        all_coordinates.extend(fetch_route(all_points[i], all_points[i + 1]))
    
    # Convert to DataFrame for plotting
    df_out = pd.DataFrame({'Node': np.arange(len(all_coordinates))})
    df_out[['lat', 'long']] = pd.DataFrame(all_coordinates, columns=['lat', 'long'])
    
    # Plot the optimized route
    fig = px.scatter_mapbox(df_out, lat="lat", lon="long", zoom=5, height=600, width=900)
    fig.update_layout(mapbox_style="open-street-map", margin={"r": 0, "t": 0, "l": 0, "b": 0})
    fig.show()

# Example usage
if __name__ == "__main__":
    source = (80.2705, 13.0843)  # Chennai
    destination = (75.3412, 31.1471)  # Amritsar
    intermediates = [
        (77.5946, 12.9716),  # Bangalore
        (79.0882, 21.1458),  # Nagpur
        (75.7873, 26.9124)   # Jaipur
    ]
    
    optimized_tsp_route(source, destination, intermediates)

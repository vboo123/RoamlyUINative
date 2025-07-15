# Map Feature for Roamly

## Overview
The map feature allows users to view their current location and nearby landmarks on an interactive map. Users can tap on landmark markers to view details and navigate to the landmark's detail page.

## Features

### Interactive Map
- **User Location**: Shows the user's current location with a blue marker
- **Landmark Markers**: Displays nearby landmarks with red markers
- **Interactive Markers**: Tap on any landmark marker to see details
- **Navigation**: Tap "View Details" to go to the landmark's detail page

### Map Controls
- **My Location Button**: Tap to center the map on user's location
- **Compass**: Shows direction and allows rotation
- **Scale**: Shows map scale for distance reference
- **Buildings**: Shows 3D building outlines
- **Indoor Maps**: Shows indoor floor plans where available

## Setup

### 1. Dependencies
The following packages are already installed:
- `react-native-maps`: For the interactive map component
- `expo-location`: For getting user location

### 2. Permissions
Location permissions are configured in `app.json`:
- iOS: `NSLocationWhenInUseUsageDescription`
- Android: `ACCESS_FINE_LOCATION`, `ACCESS_COARSE_LOCATION`

### 3. Google Maps API (Optional)
For production, you may want to add Google Maps API keys:
- Add `googleMapsApiKey` to the `android` section in `app.json`
- Add `googleMapsApiKey` to the `ios` section in `app.json`

## Usage

### Tab Navigation
- **Explore Tab**: Shows landmarks in a list format
- **Map Tab**: Shows landmarks on an interactive map

### Map Interactions
1. **View Landmarks**: All nearby landmarks appear as red markers
2. **Tap Marker**: Shows landmark name and location
3. **View Details**: Navigate to the landmark's detail page
4. **Your Location**: Blue marker shows your current position

### Error Handling
- **Location Permission Denied**: Shows error message
- **No Landmarks Found**: Shows appropriate message
- **Network Errors**: Shows retry message

## Technical Details

### Components
- `MapScreen`: Main map component with markers
- `MapView`: React Native Maps component
- `Marker`: Individual landmark markers

### Data Flow
1. Get user location using `expo-location`
2. Fetch nearby landmarks from API
3. Display landmarks as markers on map
4. Handle marker interactions

### Styling
- Supports both light and dark mode
- Uses theme colors for markers and UI elements
- Responsive design for different screen sizes

## Future Enhancements

### Potential Features
- **Custom Markers**: Different icons for different landmark types
- **Clustering**: Group nearby markers when zoomed out
- **Directions**: Show route to selected landmark
- **Search**: Search for specific landmarks
- **Favorites**: Save favorite landmarks
- **Offline Maps**: Cache map data for offline use

### Performance Optimizations
- **Marker Clustering**: For large numbers of landmarks
- **Lazy Loading**: Load landmarks as user scrolls
- **Caching**: Cache landmark data locally
- **Image Optimization**: Optimize landmark images

## Troubleshooting

### Common Issues
1. **Map not loading**: Check internet connection
2. **Location not working**: Ensure location permissions are granted
3. **Markers not showing**: Check API response format
4. **Performance issues**: Consider marker clustering for large datasets

### Debug Tips
- Check console logs for API responses
- Verify location permissions in device settings
- Test with different zoom levels
- Monitor network requests in developer tools 
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { geocodeAddress } from '../utils/geocode';
import { MAPBOX_ACCESS_TOKEN } from '../config/keys';

// Try to import WebView, fallback to manual entry if not available
let WebView = null;
try {
  WebView = require('react-native-webview').WebView;
} catch (e) {
  console.log('WebView not available, using manual entry');
}

export default function MapPickerScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { initialLocation, onConfirm, address } = route.params || {};
  const webViewRef = useRef(null);

  const [selectedLocation, setSelectedLocation] = useState(initialLocation || null);
  const [isGeocoding, setIsGeocoding] = useState(!!(address && !initialLocation));

  // When address is passed (e.g. from property form), geocode and place the pin at that location
  useEffect(() => {
    if (!address || !address.trim()) {
      setIsGeocoding(false);
      return;
    }
    let cancelled = false;
    setIsGeocoding(true);
    geocodeAddress(address.trim(), MAPBOX_ACCESS_TOKEN)
      .then((coords) => {
        if (!cancelled && coords) setSelectedLocation(coords);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setIsGeocoding(false);
      });
    return () => { cancelled = true; };
  }, [address]);

  const handleMapMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'locationSelected') {
        setSelectedLocation({
          latitude: data.latitude,
          longitude: data.longitude,
        });
      }
    } catch (error) {
      console.error('Error parsing map message:', error);
    }
  };

  const [isConfirmPressed, setIsConfirmPressed] = useState(false);

  const handleConfirm = () => {
    if (!selectedLocation) return;
    
    // Show visual feedback
    setIsConfirmPressed(true);
    
    // Short delay to show blue feedback
    setTimeout(() => {
      if (onConfirm) {
        onConfirm(selectedLocation);
      }
      navigation.goBack();
    }, 200); // Very short delay (200ms)
  };

  const handleConfirmPressIn = () => {
    setIsConfirmPressed(true);
  };

  const handleConfirmPressOut = () => {
    setIsConfirmPressed(false);
  };

  const getMapHTML = () => {
    const lat = selectedLocation?.latitude || initialLocation?.latitude || 37.78825;
    const lng = selectedLocation?.longitude || initialLocation?.longitude || -122.4324;
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
          <script src="https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js"></script>
          <link href="https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css" rel="stylesheet" />
          <style>
            body, html { margin: 0; padding: 0; height: 100%; overflow: hidden; }
            #map { height: 100%; width: 100%; }
            .mapboxgl-ctrl-top-left { top: 10px; left: 10px; }
            .mapboxgl-ctrl-top-right { top: 10px; right: 10px; }
            .marker {
              background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="%2330ACFF"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>');
              background-size: cover;
              width: 32px;
              height: 32px;
              border-radius: 50%;
              cursor: pointer;
            }
          </style>
        </head>
        <body>
          <div id="map"></div>
          <script>
            mapboxgl.accessToken = '${MAPBOX_ACCESS_TOKEN}';
            
            let map = new mapboxgl.Map({
              container: 'map',
              style: 'mapbox://styles/mapbox/satellite-streets-v12',
              center: [${lng}, ${lat}],
              zoom: 15,
              attributionControl: false
            });
            
            // Create a marker element
            const el = document.createElement('div');
            el.className = 'marker';
            
            // Create marker
            let marker = new mapboxgl.Marker({
              element: el,
              draggable: true
            })
              .setLngLat([${lng}, ${lat}])
              .addTo(map);
            
            // Handle map click
            map.on('click', function(e) {
              const lng = e.lngLat.lng;
              const lat = e.lngLat.lat;
              marker.setLngLat([lng, lat]);
              sendLocation(lat, lng);
            });
            
            // Handle marker drag
            marker.on('dragend', function() {
              const lngLat = marker.getLngLat();
              sendLocation(lngLat.lat, lngLat.lng);
            });
            
            function sendLocation(lat, lng) {
              if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'locationSelected',
                  latitude: lat,
                  longitude: lng
                }));
              }
            }
            
            // Add navigation controls
            map.addControl(new mapboxgl.NavigationControl(), 'top-right');
          </script>
        </body>
      </html>
    `;
  };

  // If WebView is not available, show error message
  if (!WebView) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
            <Ionicons name="close" size={28} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Select Location</Text>
          <View style={{ width: 28 }} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={60} color="#ff6b6b" />
          <Text style={styles.errorTitle}>Map Not Available</Text>
          <Text style={styles.errorText}>
            Please install react-native-webview to use the interactive map.
          </Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
          <Ionicons name="close" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Location</Text>
        <View style={{ width: 28 }} />
      </View>

      {(isGeocoding && !selectedLocation) ? (
        <View style={styles.mapLoading}>
          <ActivityIndicator size="large" color="#30ACFF" />
          <Text style={styles.mapLoadingText}>Locating address on map…</Text>
        </View>
      ) : (
        <WebView
          ref={webViewRef}
          style={styles.map}
          source={{ html: getMapHTML() }}
          onMessage={handleMapMessage}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          scrollEnabled={false}
          zoomEnabled={true}
        />
      )}

      <View style={styles.footer}>
        {selectedLocation && (
          <View style={styles.locationInfo}>
            <Ionicons name="location" size={20} color="#999" />
            <Text style={styles.locationText}>
              {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
            </Text>
          </View>
        )}
        <TouchableOpacity 
          style={[
            styles.confirmButton, 
            !selectedLocation && styles.confirmButtonDisabled,
            isConfirmPressed && styles.confirmButtonActive
          ]} 
          onPress={handleConfirm}
          onPressIn={handleConfirmPressIn}
          onPressOut={handleConfirmPressOut}
          disabled={!selectedLocation}
          activeOpacity={0.8}
        >
          <Ionicons name="checkmark" size={24} color="#fff" />
          <Text style={styles.confirmButtonText}>Confirm Location</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  content: {
    padding: 20,
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  mapPlaceholder: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    height: 200,
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    padding: 12,
    backgroundColor: '#E8E8E8',
    borderRadius: 8,
    gap: 8,
  },
  mapButtonText: {
    fontSize: 16,
    color: '#666',
  },
  coordinatesSection: {
    marginBottom: 30,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    height: 50,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#333',
  },
  map: {
    flex: 1,
  },
  mapLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  mapLoadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  footer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    gap: 8,
  },
  locationText: {
    fontSize: 14,
    color: '#666',
  },
  confirmButton: {
    backgroundColor: '#A8A8A8',
    borderRadius: 8,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  confirmButtonActive: {
    backgroundColor: '#30ACFF',
    transform: [{ scale: 0.98 }],
  },
  confirmButtonDisabled: {
    backgroundColor: '#D0D0D0',
    opacity: 0.6,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  backButton: {
    backgroundColor: '#30ACFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});


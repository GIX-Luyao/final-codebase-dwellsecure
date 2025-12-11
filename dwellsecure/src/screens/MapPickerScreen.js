import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  TextInput,
  Linking,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

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

  const [selectedLocation, setSelectedLocation] = useState(
    initialLocation || null
  );
  const [latitude, setLatitude] = useState(
    initialLocation?.latitude?.toString() || ''
  );
  const [longitude, setLongitude] = useState(
    initialLocation?.longitude?.toString() || ''
  );
  const [useManualEntry, setUseManualEntry] = useState(!WebView);

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

  const handleManualConfirm = () => {
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    
    if (isNaN(lat) || isNaN(lng)) {
      Alert.alert('Error', 'Please enter valid coordinates');
      return;
    }
    
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      Alert.alert('Error', 'Invalid coordinate values');
      return;
    }
    
    const location = { latitude: lat, longitude: lng };
    if (onConfirm) {
      onConfirm(location);
    }
    navigation.goBack();
  };

  const handleConfirm = () => {
    if (useManualEntry) {
      handleManualConfirm();
      return;
    }
    
    if (selectedLocation && onConfirm) {
      onConfirm(selectedLocation);
    }
    navigation.goBack();
  };

  const handleOpenExternalMap = async () => {
    const mapAddress = address || '';
    let url = '';
    
    if (Platform.OS === 'ios') {
      url = `maps://maps.apple.com/?q=${encodeURIComponent(mapAddress)}`;
    } else {
      url = `geo:0,0?q=${encodeURIComponent(mapAddress)}`;
    }
    
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        const webUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapAddress)}`;
        await Linking.openURL(webUrl);
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to open map application');
    }
  };

  const getMapHTML = () => {
    const lat = selectedLocation?.latitude || initialLocation?.latitude || 37.78825;
    const lng = selectedLocation?.longitude || initialLocation?.longitude || -122.4324;

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
          <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
          <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
          <style>
            body, html { margin: 0; padding: 0; height: 100%; overflow: hidden; }
            #map { height: 100%; width: 100%; }
          </style>
        </head>
        <body>
          <div id="map"></div>
          <script>
            let map;
            let marker;
            
            function initMap() {
              map = new L.Map('map', {
                center: [${lat}, ${lng}],
                zoom: 15,
                zoomControl: true
              });
              
              L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 19
              }).addTo(map);
              
              marker = L.marker([${lat}, ${lng}], {
                draggable: true
              }).addTo(map);
              
              map.on('click', function(e) {
                const lat = e.latlng.lat;
                const lng = e.latlng.lng;
                marker.setLatLng([lat, lng]);
                sendLocation(lat, lng);
              });
              
              marker.on('dragend', function(e) {
                const lat = e.target.getLatLng().lat;
                const lng = e.target.getLatLng().lng;
                sendLocation(lat, lng);
              });
            }
            
            function sendLocation(lat, lng) {
              if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'locationSelected',
                  latitude: lat,
                  longitude: lng
                }));
              }
            }
            
            initMap();
          </script>
        </body>
      </html>
    `;
  };

  if (useManualEntry || !WebView) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
            <Ionicons name="close" size={28} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Select Location</Text>
          <View style={{ width: 28 }} />
        </View>

        <View style={styles.content}>
          <Text style={styles.instructionText}>
            Enter coordinates or use the map app to find them
          </Text>

          <View style={styles.mapPlaceholder}>
            <Ionicons name="map" size={80} color="#ccc" />
            <TouchableOpacity style={styles.mapButton} onPress={handleOpenExternalMap}>
              <Ionicons name="location" size={24} color="#999" />
              <Text style={styles.mapButtonText}>Open in Map App</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.coordinatesSection}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Latitude</Text>
              <TextInput
                style={styles.input}
                value={latitude}
                onChangeText={setLatitude}
                placeholder="e.g., 37.78825"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Longitude</Text>
              <TextInput
                style={styles.input}
                value={longitude}
                onChangeText={setLongitude}
                placeholder="e.g., -122.4324"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.confirmButton, (!latitude || !longitude) && styles.confirmButtonDisabled]} 
            onPress={handleConfirm}
            disabled={!latitude || !longitude}
          >
            <Ionicons name="checkmark" size={24} color="#fff" />
            <Text style={styles.confirmButtonText}>Confirm Location</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
          style={[styles.confirmButton, !selectedLocation && styles.confirmButtonDisabled]} 
          onPress={handleConfirm}
          disabled={!selectedLocation}
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
  confirmButtonDisabled: {
    backgroundColor: '#D0D0D0',
    opacity: 0.6,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});


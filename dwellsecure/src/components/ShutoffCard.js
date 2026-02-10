import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ShutoffCard({ shutoff, onEdit, onDelete }) {
  const isVerified = shutoff.verification_status === 'verified';
  const shutoffType = shutoff.type || 'gas';
  
  // Get type label and icon
  const getTypeInfo = () => {
    switch (shutoffType) {
      case 'gas':
      case 'fire':
        return { label: 'Gas', icon: 'flame-outline', color: '#ff6b35' };
      case 'electric':
      case 'power':
        return { label: 'Electric', icon: 'flash-outline', color: '#ffc107' };
      case 'water':
        return { label: 'Water', icon: 'water-outline', color: '#2196f3' };
      default:
        return { label: 'Utility', icon: 'construct-outline', color: '#666' };
    }
  };
  
  const typeInfo = getTypeInfo();
  const displayName = shutoff.name || shutoff.description || `${typeInfo.label} Shutoff`;

  return (
    <View style={[styles.card, isVerified && styles.cardVerified]}>
      <View style={styles.cardContent}>
        <View style={styles.header}>
          <View style={styles.titleSection}>
            <View style={styles.typeBadge}>
              <Ionicons name={typeInfo.icon} size={16} color={typeInfo.color} />
              <Text style={styles.typeLabel}>{typeInfo.label}</Text>
            </View>
            <Text style={styles.name}>{displayName}</Text>
          </View>
          <View style={styles.actions}>
            <TouchableOpacity onPress={onEdit} style={styles.actionButton}>
              <Ionicons name="pencil" size={20} color="#0066cc" />
            </TouchableOpacity>
            <TouchableOpacity onPress={onDelete} style={styles.actionButton}>
              <Ionicons name="trash" size={20} color="#ff4444" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.verificationRow}>
          {isVerified ? (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={18} color="#4caf50" />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          ) : (
            <View style={styles.unverifiedBadge}>
              <Ionicons name="close-circle-outline" size={18} color="#ff9800" />
              <Text style={styles.unverifiedText}>Unverified</Text>
            </View>
          )}
        </View>

        {shutoff.location && (
          <View style={styles.infoRow}>
            <Ionicons name="location" size={16} color="#666" />
            <Text style={styles.infoText}>{shutoff.location}</Text>
          </View>
        )}

        {shutoff.contacts && shutoff.contacts.length > 0 && (
          <View style={styles.infoRow}>
            <Ionicons name="person" size={16} color="#666" />
            <Text style={styles.infoText}>
              {shutoff.contacts.map(c => c.name || c.role || 'Technician').join(', ')}
            </Text>
          </View>
        )}

        {shutoff.documentName && (
          <View style={styles.infoRow}>
            <Ionicons name="document-attach" size={16} color="#666" />
            <Text style={styles.infoText}>{shutoff.documentName}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  cardVerified: {
    borderColor: '#4caf50',
    backgroundColor: '#f1f8f4',
  },
  cardContent: {
    padding: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  titleSection: {
    flex: 1,
    marginRight: 10,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    alignSelf: 'flex-start',
  },
  typeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    marginLeft: 10,
    padding: 5,
  },
  verificationRow: {
    marginBottom: 8,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  verifiedText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
    color: '#2e7d32',
  },
  unverifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3e0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  unverifiedText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
    color: '#e65100',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
});


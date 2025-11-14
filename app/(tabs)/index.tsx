import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import * as Location from 'expo-location';
import * as SMS from 'expo-sms';
import React, { useState } from 'react';
import { Alert, Modal, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const STORAGE_KEY = 'saviours_contacts';
const DEFAULT_MESSAGE = 'SOS! I need help. Please contact me as soon as possible.';

export default function HomeScreen() {
  const [locationModal, setLocationModal] = useState(false);
  const [locationUrl, setLocationUrl] = useState('');

  const handleSendSOS = async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (!data) {
        Alert.alert('No contacts found', 'Please add saviour contacts first.');
        return;
      }

      const contacts = JSON.parse(data);
      const numbers = contacts
        .map((c: any) => c.phone)
        .filter((num: string) => !!num);

      if (numbers.length === 0) {
        Alert.alert('No valid numbers', 'Please add valid contact numbers.');
        return;
      }

      const isAvailable = await SMS.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('SMS not available', 'Your device cannot send SMS.');
        return;
      }

      // Get location
      let locationMessage = '';
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;
        locationMessage = `\nMy location: https://maps.google.com/?q=${latitude},${longitude}`;
      } else {
        locationMessage = '\nLocation not available.';
      }

      const message = `${DEFAULT_MESSAGE}${locationMessage}`;

      await SMS.sendSMSAsync(numbers, message);
      Alert.alert('SOS Sent', 'Alert message sent to your saviours.');
    } catch (error) {
      Alert.alert('Error', 'Failed to send SOS.');
    }
  };

  const handleLiveLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Location permission is required.');
      return;
    }

    const location = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = location.coords;
    const url = `https://maps.google.com/?q=${latitude},${longitude}`;
    setLocationUrl(url);
    setLocationModal(true);
  };

  const handleCopy = () => {
    Clipboard.setStringAsync(locationUrl);
    Alert.alert('Copied', 'Location link copied to clipboard.');
  };

  const handleShare = async () => {
    try {
      if (!locationUrl) {
        Alert.alert('No Location', 'Please fetch your live location first.');
        return;
      }

      await Share.share({
        message: `Here's my live location: ${locationUrl}`,
        title: 'Share Location',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share location.');
    }
  };

  const handleSendToContacts = async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (!data) {
        Alert.alert('No contacts found', 'Please add saviour contacts first.');
        return;
      }

      const contacts = JSON.parse(data);
      const numbers = contacts
        .map((c: any) => c.phone)
        .filter((num: string) => !!num);

      if (numbers.length === 0) {
        Alert.alert('No valid numbers', 'Please add valid contact numbers.');
        return;
      }

      const isAvailable = await SMS.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('SMS not available', 'Your device cannot send SMS.');
        return;
      }

      await SMS.sendSMSAsync(numbers, `My live location: ${locationUrl}`);
      Alert.alert('Location Sent', 'Location sent to your saviours.');
    } catch (error) {
      Alert.alert('Error', 'Failed to send location.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Center Heading */}
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Undershell</ThemedText>
      </ThemedView>

      {/* Centered SOS Button and Live Location */}
      <View style={styles.centerContainer}>
        <TouchableOpacity style={styles.sosButton} onPress={handleSendSOS}>
          <Text style={styles.sosButtonText}>Send SOS</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.locationButton} onPress={handleLiveLocation}>
          <Text style={styles.locationButtonText}>Live Location</Text>
        </TouchableOpacity>
      </View>

      {/* Modal for Live Location */}
      <Modal visible={locationModal} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Your Live Location</Text>
            <Text style={styles.modalUrl}>{locationUrl}</Text>

            <TouchableOpacity style={styles.modalBtn} onPress={handleCopy}>
              <Text style={styles.modalBtnText}>Copy</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.modalBtn} onPress={handleShare}>
              <Text style={styles.modalBtnText}>Share</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.modalBtn} onPress={handleSendToContacts}>
              <Text style={styles.modalBtnText}>Send to Contacts</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.closeBtn} onPress={() => setLocationModal(false)}>
              <Text style={styles.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181818',
    justifyContent: 'flex-start',
  },
  titleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 32,
    paddingBottom: 24,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sosButton: {
    backgroundColor: '#e53935',
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 12,
    marginBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  sosButtonText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 1,
    fontFamily: 'Cursive',
  },
  locationButton: {
    backgroundColor: '#3949ab',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  locationButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Cursive',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#222',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    width: '80%',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 22,
    fontFamily: 'Cursive',
    marginBottom: 12,
  },
  modalUrl: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 18,
    textAlign: 'center',
    fontFamily: 'Cursive',
  },
  modalBtn: {
    backgroundColor: '#3949ab',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
    marginBottom: 10,
    alignItems: 'center',
    width: '100%',
  },
  modalBtnText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Cursive',
  },
  closeBtn: {
    backgroundColor: '#e53935',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
    marginTop: 10,
    alignItems: 'center',
    width: '100%',
  },
  closeBtnText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Cursive',
  },
});

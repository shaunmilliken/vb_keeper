import { useCallback, useState } from 'react';
import { Modal, StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ARCHIVE_KEY } from './MatchHistoryScreen';

function formatDate(isoString) {
  const d = new Date(isoString);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function ArchiveListScreen({ navigation }) {
  const [archives, setArchives] = useState([]);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  useFocusEffect(
    useCallback(() => {
      async function load() {
        const raw = await AsyncStorage.getItem(ARCHIVE_KEY);
        setArchives(raw ? JSON.parse(raw) : []);
      }
      load();
    }, [])
  );

  async function confirmDelete() {
    const updated = archives.filter((a) => a.id !== pendingDeleteId);
    await AsyncStorage.setItem(ARCHIVE_KEY, JSON.stringify(updated));
    setArchives(updated);
    setPendingDeleteId(null);
  }

  return (
    <View style={styles.container}>
      {archives.length === 0 ? (
        <Text style={styles.empty}>No archives yet.</Text>
      ) : (
        <ScrollView style={styles.list}>
          {archives.map((archive) => (
            <TouchableOpacity
              key={archive.id}
              style={styles.card}
              onPress={() => navigation.navigate('ViewArchive', { archiveId: archive.id, name: archive.name })}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.name}>{archive.name}</Text>
                <TouchableOpacity
                  onPress={() => setPendingDeleteId(archive.id)}
                  style={styles.trashBtn}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="trash-outline" size={18} color="#c04040" />
                </TouchableOpacity>
              </View>
              <View style={styles.meta}>
                <Text style={styles.metaText}>{archive.matches.length} match{archive.matches.length !== 1 ? 'es' : ''}</Text>
                <Text style={styles.metaText}>{formatDate(archive.date)}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <Modal transparent animationType="fade" visible={pendingDeleteId !== null}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Delete Archive?</Text>
            <Text style={styles.modalMessage}>This will permanently delete the archive and all its match results.</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnNo]}
                onPress={() => setPendingDeleteId(null)}
              >
                <Text style={styles.modalBtnTextNo}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnYes]}
                onPress={confirmDelete}
              >
                <Text style={styles.modalBtnTextYes}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    paddingTop: 16,
  },
  empty: {
    color: '#a0a0c0',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 60,
  },
  list: {
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: '#16213e',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  name: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  trashBtn: {
    padding: 4,
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaText: {
    color: '#a0a0c0',
    fontSize: 13,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBox: {
    backgroundColor: '#16213e',
    borderRadius: 14,
    padding: 28,
    width: '80%',
  },
  modalTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalMessage: {
    color: '#a0a0c0',
    fontSize: 15,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalBtn: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  modalBtnNo: {
    backgroundColor: '#333355',
  },
  modalBtnYes: {
    backgroundColor: '#c04040',
  },
  modalBtnTextNo: {
    color: '#a0a0c0',
    fontSize: 16,
  },
  modalBtnTextYes: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

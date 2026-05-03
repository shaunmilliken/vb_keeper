import { useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MATCH_HISTORY_KEY } from './ScoreScreen';

export const ARCHIVE_KEY = 'archives';

function formatDate(isoString) {
  const d = new Date(isoString);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatSets(sets) {
  return sets.map((s) => `${s.a}–${s.b}`).join(', ');
}

export default function MatchHistoryScreen() {
  const [history, setHistory] = useState([]);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [archiveName, setArchiveName] = useState('');

  useEffect(() => {
    async function load() {
      const raw = await AsyncStorage.getItem(MATCH_HISTORY_KEY);
      setHistory(raw ? JSON.parse(raw) : []);
    }
    load();
  }, []);

  async function confirmDelete() {
    const updated = history.filter((m) => m.id !== pendingDeleteId);
    await AsyncStorage.setItem(MATCH_HISTORY_KEY, JSON.stringify(updated));
    setHistory(updated);
    setPendingDeleteId(null);
  }

  async function saveArchive() {
    const name = archiveName.trim() || 'Unnamed Season';
    const archive = {
      id: Date.now(),
      name,
      date: new Date().toISOString(),
      matches: history,
    };
    const raw = await AsyncStorage.getItem(ARCHIVE_KEY);
    const archives = raw ? JSON.parse(raw) : [];
    archives.unshift(archive);
    await AsyncStorage.setItem(ARCHIVE_KEY, JSON.stringify(archives));
    await AsyncStorage.removeItem(MATCH_HISTORY_KEY);
    setHistory([]);
    setArchiveName('');
    setShowArchiveModal(false);
  }

  return (
    <View style={styles.container}>
      {history.length === 0 ? (
        <Text style={styles.empty}>No matches saved yet.</Text>
      ) : (
        <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
          {history.map((match) => (
            <View key={match.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.teams}>{match.teamA} vs {match.teamB}</Text>
                <View style={styles.cardHeaderRight}>
                  <Text style={styles.date}>{formatDate(match.date)}</Text>
                  <TouchableOpacity
                    onPress={() => setPendingDeleteId(match.id)}
                    style={styles.trashBtn}
                  >
                    <Ionicons name="trash-outline" size={18} color="#c04040" />
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={styles.sets}>{formatSets(match.sets)}</Text>
              {match.winner === 'draw' ? (
                <Text style={styles.draw}>Draw</Text>
              ) : match.winner ? (
                <Text style={styles.winner}>{match.winner} won</Text>
              ) : (
                <Text style={styles.incomplete}>Match incomplete</Text>
              )}
            </View>
          ))}
        </ScrollView>
      )}

      {history.length > 0 && (
        <TouchableOpacity style={styles.archiveBtn} onPress={() => setShowArchiveModal(true)}>
          <Ionicons name="archive-outline" size={18} color="#a0a0c0" style={styles.archiveBtnIcon} />
          <Text style={styles.archiveBtnText}>Archive Season</Text>
        </TouchableOpacity>
      )}

      {/* Delete confirmation modal */}
      <Modal transparent animationType="fade" visible={pendingDeleteId !== null}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Delete Match?</Text>
            <Text style={styles.modalMessage}>This will permanently remove the match from your history.</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnNo]}
                onPress={() => setPendingDeleteId(null)}
              >
                <Text style={styles.modalBtnTextNo}>No</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnYes]}
                onPress={confirmDelete}
              >
                <Text style={styles.modalBtnTextYes}>Yes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Archive season modal */}
      <Modal transparent animationType="fade" visible={showArchiveModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Archive Season</Text>
            <Text style={styles.modalMessage}>
              Give this season a name. All current matches will be moved to the archive.
            </Text>
            <TextInput
              style={styles.archiveInput}
              value={archiveName}
              onChangeText={setArchiveName}
              placeholder="e.g. Spring 2026"
              placeholderTextColor="#555577"
              maxLength={40}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnNo]}
                onPress={() => { setShowArchiveModal(false); setArchiveName(''); }}
              >
                <Text style={styles.modalBtnTextNo}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnSave]}
                onPress={saveArchive}
              >
                <Text style={styles.modalBtnTextSave}>Save</Text>
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
  listContent: {
    paddingBottom: 8,
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
  cardHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  teams: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  date: {
    color: '#a0a0c0',
    fontSize: 13,
  },
  trashBtn: {
    padding: 4,
  },
  sets: {
    color: '#c0c0e0',
    fontSize: 14,
    marginBottom: 6,
  },
  winner: {
    color: '#f0c040',
    fontSize: 13,
    fontWeight: '600',
  },
  draw: {
    color: '#a0a0c0',
    fontSize: 13,
    fontWeight: '600',
  },
  incomplete: {
    color: '#a0a0c0',
    fontSize: 13,
    fontStyle: 'italic',
  },
  archiveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16213e',
    borderColor: '#333355',
    borderWidth: 1,
    borderRadius: 10,
    marginHorizontal: 20,
    marginVertical: 16,
    paddingVertical: 14,
  },
  archiveBtnIcon: {
    marginRight: 8,
  },
  archiveBtnText: {
    color: '#a0a0c0',
    fontSize: 16,
    fontWeight: '600',
  },
  archiveInput: {
    backgroundColor: '#0d1626',
    borderColor: '#333355',
    borderWidth: 1,
    borderRadius: 8,
    color: '#ffffff',
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 20,
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
    marginBottom: 20,
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
  modalBtnSave: {
    backgroundColor: '#4a90d9',
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
  modalBtnTextSave: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

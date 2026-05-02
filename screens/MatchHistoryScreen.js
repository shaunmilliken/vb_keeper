import { useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MATCH_HISTORY_KEY } from './ScoreScreen';

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

  return (
    <View style={styles.container}>
      {history.length === 0 ? (
        <Text style={styles.empty}>No matches saved yet.</Text>
      ) : (
        <ScrollView style={styles.list}>
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
              {match.winner ? (
                <Text style={styles.winner}>{match.winner} won</Text>
              ) : (
                <Text style={styles.incomplete}>Match incomplete</Text>
              )}
            </View>
          ))}
        </ScrollView>
      )}

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
  incomplete: {
    color: '#a0a0c0',
    fontSize: 13,
    fontStyle: 'italic',
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

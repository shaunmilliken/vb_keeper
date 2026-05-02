import { useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, View, TouchableOpacity, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MATCH_HISTORY_KEY } from './ScoreScreen';

export const SETTINGS_KEYS = {
  teamAName: 'settings.teamAName',
  teamBName: 'settings.teamBName',
  numSets:   'settings.numSets',
  startScore: 'settings.startScore',
};

export const DEFAULTS = {
  teamAName:  'My Team',
  teamBName:  'Opponent',
  numSets:    3,
  startScore: 4,
};

function OptionSelector({ options, selected, onSelect }) {
  return (
    <View style={selectorStyles.row}>
      {options.map((opt) => (
        <TouchableOpacity
          key={opt}
          style={[selectorStyles.option, selected === opt && selectorStyles.optionSelected]}
          onPress={() => onSelect(opt)}
        >
          <Text style={[selectorStyles.optionText, selected === opt && selectorStyles.optionTextSelected]}>
            {opt}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const selectorStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  option: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#16213e',
    borderWidth: 1,
    borderColor: '#333355',
    marginRight: 8,
    borderRadius: 8,
  },
  optionSelected: {
    backgroundColor: '#4a90d9',
    borderColor: '#4a90d9',
  },
  optionText: {
    color: '#a0a0c0',
    fontSize: 16,
  },
  optionTextSelected: {
    color: '#ffffff',
    fontWeight: '600',
  },
});

export default function SettingsScreen() {
  const [teamAName, setTeamAName] = useState('');
  const [teamBName, setTeamBName] = useState('');
  const [numSets, setNumSets] = useState(DEFAULTS.numSets);
  const [startScore, setStartScore] = useState(DEFAULTS.startScore);
  const [saved, setSaved] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    async function load() {
      const a  = await AsyncStorage.getItem(SETTINGS_KEYS.teamAName);
      const b  = await AsyncStorage.getItem(SETTINGS_KEYS.teamBName);
      const ns = await AsyncStorage.getItem(SETTINGS_KEYS.numSets);
      const ss = await AsyncStorage.getItem(SETTINGS_KEYS.startScore);
      setTeamAName(a  ?? DEFAULTS.teamAName);
      setTeamBName(b  ?? DEFAULTS.teamBName);
      setNumSets(ns   ? Number(ns) : DEFAULTS.numSets);
      setStartScore(ss ? Number(ss) : DEFAULTS.startScore);
    }
    load();
  }, []);

  async function deleteHistory() {
    await AsyncStorage.removeItem(MATCH_HISTORY_KEY);
    setShowDeleteModal(false);
  }

  async function saveSettings() {
    await AsyncStorage.setItem(SETTINGS_KEYS.teamAName,  teamAName.trim() || DEFAULTS.teamAName);
    await AsyncStorage.setItem(SETTINGS_KEYS.teamBName,  teamBName.trim() || DEFAULTS.teamBName);
    await AsyncStorage.setItem(SETTINGS_KEYS.numSets,    String(numSets));
    await AsyncStorage.setItem(SETTINGS_KEYS.startScore, String(startScore));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Team Names</Text>

      <Text style={styles.label}>Team A Default Name</Text>
      <TextInput
        style={styles.input}
        value={teamAName}
        onChangeText={setTeamAName}
        placeholder={DEFAULTS.teamAName}
        placeholderTextColor="#555577"
        maxLength={20}
      />

      <Text style={styles.label}>Team B Default Name</Text>
      <TextInput
        style={styles.input}
        value={teamBName}
        onChangeText={setTeamBName}
        placeholder={DEFAULTS.teamBName}
        placeholderTextColor="#555577"
        maxLength={20}
      />

      <View style={styles.divider} />
      <Text style={styles.sectionTitle}>Match Rules</Text>

      <Text style={styles.label}># of Sets</Text>
      <OptionSelector
        options={[2, 3, 5]}
        selected={numSets}
        onSelect={setNumSets}
      />

      <Text style={styles.label}>Start Score</Text>
      <OptionSelector
        options={[0, 4]}
        selected={startScore}
        onSelect={setStartScore}
      />

      <TouchableOpacity style={styles.saveBtn} onPress={saveSettings}>
        <Text style={styles.saveBtnText}>{saved ? 'Saved!' : 'Save Settings'}</Text>
      </TouchableOpacity>

      <View style={styles.divider} />
      <Text style={styles.sectionTitle}>Data</Text>

      <TouchableOpacity style={styles.deleteBtn} onPress={() => setShowDeleteModal(true)}>
        <Text style={styles.deleteBtnText}>Delete Match History</Text>
      </TouchableOpacity>

      <Modal transparent animationType="fade" visible={showDeleteModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Delete All History?</Text>
            <Text style={styles.modalMessage}>This will permanently delete all saved match results. This cannot be undone.</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnNo]}
                onPress={() => setShowDeleteModal(false)}
              >
                <Text style={styles.modalBtnTextNo}>No</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnYes]}
                onPress={deleteHistory}
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
    paddingHorizontal: 32,
    paddingTop: 32,
  },
  divider: {
    height: 1,
    backgroundColor: '#2a2a4a',
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#a0a0c0',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  label: {
    color: '#c0c0e0',
    fontSize: 15,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#16213e',
    borderColor: '#333355',
    borderWidth: 1,
    borderRadius: 8,
    color: '#ffffff',
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 20,
  },
  saveBtn: {
    backgroundColor: '#4a90d9',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteBtn: {
    backgroundColor: '#2a1a1a',
    borderColor: '#c04040',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  deleteBtnText: {
    color: '#c04040',
    fontSize: 16,
    fontWeight: '600',
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

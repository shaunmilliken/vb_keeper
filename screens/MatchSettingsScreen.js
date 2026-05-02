import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SETTINGS_KEYS, DEFAULTS } from './SettingsScreen';

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

export default function MatchSettingsScreen({ navigation }) {
  const [teamAName, setTeamAName] = useState(DEFAULTS.teamAName);
  const [teamBName, setTeamBName] = useState(DEFAULTS.teamBName);
  const [numSets, setNumSets] = useState(DEFAULTS.numSets);
  const [startScore, setStartScore] = useState(DEFAULTS.startScore);

  useEffect(() => {
    async function loadDefaults() {
      const a  = await AsyncStorage.getItem(SETTINGS_KEYS.teamAName);
      const b  = await AsyncStorage.getItem(SETTINGS_KEYS.teamBName);
      const ns = await AsyncStorage.getItem(SETTINGS_KEYS.numSets);
      const ss = await AsyncStorage.getItem(SETTINGS_KEYS.startScore);
      if (a)  setTeamAName(a);
      if (b)  setTeamBName(b);
      if (ns) setNumSets(Number(ns));
      if (ss) setStartScore(Number(ss));
    }
    loadDefaults();
  }, []);

  function handleGo() {
    navigation.navigate('Score', {
      teamAName: teamAName.trim() || DEFAULTS.teamAName,
      teamBName: teamBName.trim() || DEFAULTS.teamBName,
      numSets,
      startScore,
    });
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>Team Names</Text>

      <Text style={styles.label}>Team A</Text>
      <TextInput
        style={styles.input}
        value={teamAName}
        onChangeText={setTeamAName}
        placeholderTextColor="#555577"
        maxLength={20}
      />

      <Text style={styles.label}>Team B</Text>
      <TextInput
        style={styles.input}
        value={teamBName}
        onChangeText={setTeamBName}
        placeholderTextColor="#555577"
        maxLength={20}
      />

      <Text style={styles.sectionTitle}>Match Rules</Text>

      <Text style={styles.label}># of Sets</Text>
      <OptionSelector options={[2, 3, 5]} selected={numSets} onSelect={setNumSets} />

      <Text style={styles.label}>Start Score</Text>
      <OptionSelector options={[0, 4]} selected={startScore} onSelect={setStartScore} />

      <TouchableOpacity style={styles.goBtn} onPress={handleGo}>
        <Text style={styles.goBtnText}>Go!</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  content: {
    paddingHorizontal: 32,
    paddingTop: 32,
    paddingBottom: 40,
  },
  sectionTitle: {
    color: '#a0a0c0',
    fontSize: 12,
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
  goBtn: {
    backgroundColor: '#4a90d9',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  goBtnText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

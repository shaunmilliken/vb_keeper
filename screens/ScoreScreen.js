import { useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULTS } from './SettingsScreen';

export const MATCH_HISTORY_KEY = 'matchHistory';

const POINTS_TO_WIN_SET = 25;
const POINTS_TO_WIN_FINAL_SET = 15;

function scoreWinsSet(scoreA, scoreB, isFinalSet) {
  const target = isFinalSet ? POINTS_TO_WIN_FINAL_SET : POINTS_TO_WIN_SET;
  return (scoreA >= target && scoreA - scoreB >= 2) ||
         (scoreB >= target && scoreB - scoreA >= 2);
}

export default function ScoreScreen({ navigation, route }) {
  const params = route.params ?? {};
  const teamAName  = params.teamAName  ?? DEFAULTS.teamAName;
  const teamBName  = params.teamBName  ?? DEFAULTS.teamBName;
  const setsToWin  = Math.ceil((params.numSets ?? DEFAULTS.numSets) / 2);
  const startScore = params.startScore ?? DEFAULTS.startScore;

  const blankSet = () => ({ a: startScore, b: startScore });

  useEffect(() => {
    return navigation.addListener('beforeRemove', (e) => {
      const type = e.data.action.type;
      if (type === 'GO_BACK' || type === 'POP') {
        e.preventDefault();
        navigation.navigate('Home');
      }
    });
  }, [navigation]);

  const [setScores, setSetScores] = useState(() => [blankSet()]);
  const [setsWon, setSetsWon] = useState({ a: 0, b: 0 });
  const [matchOver, setMatchOver] = useState(false);
  const [winner, setWinner] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const currentSet = setScores.length - 1;
  const maxSets = setsToWin * 2 - 1;
  const isFinalSet = currentSet === maxSets - 1;
  const currentScore = setScores[currentSet];

  function addPoint(team) {
    if (matchOver) return;

    const updated = setScores.map((s, i) =>
      i === currentSet ? { ...s, [team]: s[team] + 1 } : s
    );
    const newScore = updated[currentSet];

    if (scoreWinsSet(newScore.a, newScore.b, isFinalSet)) {
      const winningTeam = newScore.a > newScore.b ? 'a' : 'b';
      const newSetsWon = { ...setsWon, [winningTeam]: setsWon[winningTeam] + 1 };
      setSetsWon(newSetsWon);

      if (newSetsWon[winningTeam] === setsToWin) {
        setSetScores(updated);
        setMatchOver(true);
        setWinner(winningTeam === 'a' ? teamAName : teamBName);
      } else {
        const nextIsFinal = updated.length === maxSets - 1;
        setSetScores([...updated, nextIsFinal ? { a: 0, b: 0 } : blankSet()]);
      }
    } else {
      setSetScores(updated);
    }
  }

  function removePoint(team) {
    if (matchOver) return;
    const score = setScores[currentSet];
    if (score[team] === 0) return;
    const updated = setScores.map((s, i) =>
      i === currentSet ? { ...s, [team]: s[team] - 1 } : s
    );
    setSetScores(updated);
  }

  async function saveMatch() {
    const record = {
      id: Date.now(),
      date: new Date().toISOString(),
      teamA: teamAName,
      teamB: teamBName,
      sets: setScores,
      setsWon,
      winner,
    };
    const raw = await AsyncStorage.getItem(MATCH_HISTORY_KEY);
    const history = raw ? JSON.parse(raw) : [];
    history.unshift(record);
    await AsyncStorage.setItem(MATCH_HISTORY_KEY, JSON.stringify(history));
  }

  function handleDone() {
    setShowSaveDialog(true);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.setLabel}>
        Set {currentSet + 1}{isFinalSet ? ' (Final)' : ''}
      </Text>

      {matchOver && (
        <View style={styles.winnerBanner}>
          <Text style={styles.winnerText}>{winner} wins the match!</Text>
        </View>
      )}

      <View style={styles.scoreboard}>
        {/* Team A */}
        <View style={styles.teamColumn}>
          <Text style={[styles.teamName, { color: '#4caf50' }]}>{teamAName}</Text>
          <Text style={styles.setsWon}>Sets: {setsWon.a}</Text>
          <Text style={[styles.score, { color: '#4caf50' }]}>{currentScore.a}</Text>
          <TouchableOpacity style={styles.btn} onPress={() => addPoint('a')}>
            <Text style={styles.btnText}>+</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.btnMinus]} onPress={() => removePoint('a')}>
            <Text style={[styles.btnText, styles.btnMinusText]}>−</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        {/* Team B */}
        <View style={styles.teamColumn}>
          <Text style={[styles.teamName, { color: '#ef5350' }]}>{teamBName}</Text>
          <Text style={styles.setsWon}>Sets: {setsWon.b}</Text>
          <Text style={[styles.score, { color: '#ef5350' }]}>{currentScore.b}</Text>
          <TouchableOpacity style={styles.btn} onPress={() => addPoint('b')}>
            <Text style={styles.btnText}>+</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.btnMinus]} onPress={() => removePoint('b')}>
            <Text style={[styles.btnText, styles.btnMinusText]}>−</Text>
          </TouchableOpacity>
        </View>
      </View>

      {(setScores.length > 1 || matchOver) && (
        <View style={styles.history}>
          <Text style={styles.historyTitle}>Set History</Text>
          {(matchOver ? setScores : setScores.slice(0, -1)).map((s, i) => (
            <Text key={i} style={styles.historyRow}>
              Set {i + 1}: {teamAName} {s.a} – {s.b} {teamBName}
            </Text>
          ))}
        </View>
      )}

      <TouchableOpacity style={styles.resetBtn} onPress={handleDone}>
        <Text style={styles.resetText}>Done</Text>
      </TouchableOpacity>

      <Modal transparent animationType="fade" visible={showSaveDialog}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Save Match?</Text>
            <Text style={styles.modalMessage}>Would you like to save the match results to your history?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnNo]}
                onPress={() => { setShowSaveDialog(false); navigation.navigate('Home'); }}
              >
                <Text style={styles.modalBtnTextNo}>No</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnYes]}
                onPress={async () => { setShowSaveDialog(false); await saveMatch(); navigation.navigate('Home'); }}
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
    alignItems: 'center',
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  setLabel: {
    color: '#a0a0c0',
    fontSize: 16,
    marginBottom: 16,
  },
  winnerBanner: {
    backgroundColor: '#f0c040',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 10,
    marginBottom: 16,
  },
  winnerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a2e',
  },
  scoreboard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  teamColumn: {
    alignItems: 'center',
    width: 140,
  },
  teamName: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 4,
  },
  setsWon: {
    color: '#a0a0c0',
    fontSize: 14,
    marginBottom: 12,
  },
  score: {
    color: '#ffffff',
    fontSize: 80,
    fontWeight: 'bold',
    lineHeight: 90,
    marginBottom: 16,
  },
  btn: {
    backgroundColor: '#16213e',
    borderColor: '#4a90d9',
    borderWidth: 2,
    borderRadius: 50,
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  btnMinus: {
    borderColor: '#c04040',
    width: 32,
    height: 32,
  },
  btnText: {
    color: '#ffffff',
    fontSize: 32,
    lineHeight: 36,
  },
  btnMinusText: {
    fontSize: 16,
    lineHeight: 18,
  },
  divider: {
    width: 2,
    height: 200,
    backgroundColor: '#333355',
    marginHorizontal: 16,
  },
  history: {
    alignItems: 'center',
    marginBottom: 24,
  },
  historyTitle: {
    color: '#a0a0c0',
    fontSize: 14,
    marginBottom: 6,
  },
  historyRow: {
    color: '#c0c0e0',
    fontSize: 15,
    marginBottom: 2,
  },
  resetBtn: {
    backgroundColor: '#333355',
    borderRadius: 8,
    paddingHorizontal: 32,
    paddingVertical: 12,
  },
  resetText: {
    color: '#e0e0e0',
    fontSize: 16,
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
});

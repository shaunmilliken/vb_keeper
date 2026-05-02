import { useCallback, useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, View, TouchableOpacity, useWindowDimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import * as ScreenOrientation from 'expo-screen-orientation';
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
  const numSets    = params.numSets    ?? DEFAULTS.numSets;
  const isTwoSetMatch = numSets === 2;
  const setsToWin  = isTwoSetMatch ? null : Math.ceil(numSets / 2);
  const startScore = params.startScore ?? DEFAULTS.startScore;

  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  const blankSet = () => ({ a: startScore, b: startScore });

  useFocusEffect(
    useCallback(() => {
      ScreenOrientation.unlockAsync();
      return () => {
        ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
      };
    }, [])
  );

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
  const maxSets = isTwoSetMatch ? 2 : (setsToWin * 2 - 1);
  const isFinalSet = !isTwoSetMatch && currentSet === maxSets - 1;
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

      if (isTwoSetMatch) {
        if (updated.length === 2) {
          setSetScores(updated);
          setMatchOver(true);
          if (newSetsWon.a > newSetsWon.b) setWinner(teamAName);
          else if (newSetsWon.b > newSetsWon.a) setWinner(teamBName);
          else setWinner('draw');
        } else {
          setSetScores([...updated, blankSet()]);
        }
      } else if (newSetsWon[winningTeam] === setsToWin) {
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
      winner: winner === 'draw' ? '' : winner,
    };
    const raw = await AsyncStorage.getItem(MATCH_HISTORY_KEY);
    const history = raw ? JSON.parse(raw) : [];
    history.unshift(record);
    await AsyncStorage.setItem(MATCH_HISTORY_KEY, JSON.stringify(history));
  }

  function handleDone() {
    setShowSaveDialog(true);
  }

  const saveDialog = (
    <Modal transparent animationType="fade" visible={showSaveDialog}>
      <View style={portrait.modalOverlay}>
        <View style={portrait.modalBox}>
          <Text style={portrait.modalTitle}>Save Match?</Text>
          <Text style={portrait.modalMessage}>Would you like to save the match results to your history?</Text>
          <View style={portrait.modalButtons}>
            <TouchableOpacity
              style={[portrait.modalBtn, portrait.modalBtnNo]}
              onPress={() => { setShowSaveDialog(false); navigation.navigate('Home'); }}
            >
              <Text style={portrait.modalBtnTextNo}>No</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[portrait.modalBtn, portrait.modalBtnYes]}
              onPress={async () => { setShowSaveDialog(false); await saveMatch(); navigation.navigate('Home'); }}
            >
              <Text style={portrait.modalBtnTextYes}>Yes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (isLandscape) {
    return (
      <View style={landscape.container}>
        {/* Top bar: set label and winner banner */}
        <View style={landscape.topBar}>
          <Text style={landscape.setLabel}>
            Set {currentSet + 1}{isFinalSet ? ' (Final)' : ''}
          </Text>
          {matchOver && (
            <View style={landscape.winnerBanner}>
              <Text style={landscape.winnerText}>
                {winner === 'draw' ? 'Match ends in a draw!' : `${winner} wins!`}
              </Text>
            </View>
          )}
        </View>

        <View style={landscape.mainRow}>
          {/* Team A */}
          <View style={landscape.teamSection}>
            <Text style={[landscape.teamName, { color: '#4caf50' }]}>{teamAName}</Text>
            <Text style={landscape.setsWon}>Sets: {setsWon.a}</Text>
            <View style={landscape.scoreRow}>
              <TouchableOpacity style={landscape.btnMinus} onPress={() => removePoint('a')}>
                <Text style={landscape.btnMinusText}>−</Text>
              </TouchableOpacity>
              <Text style={[landscape.score, { color: '#4caf50' }]}>{currentScore.a}</Text>
              <TouchableOpacity style={landscape.btnPlus} onPress={() => addPoint('a')}>
                <Text style={landscape.btnPlusText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={landscape.divider} />

          {/* Team B */}
          <View style={landscape.teamSection}>
            <Text style={[landscape.teamName, { color: '#ef5350' }]}>{teamBName}</Text>
            <Text style={landscape.setsWon}>Sets: {setsWon.b}</Text>
            <View style={landscape.scoreRow}>
              <TouchableOpacity style={landscape.btnMinus} onPress={() => removePoint('b')}>
                <Text style={landscape.btnMinusText}>−</Text>
              </TouchableOpacity>
              <Text style={[landscape.score, { color: '#ef5350' }]}>{currentScore.b}</Text>
              <TouchableOpacity style={landscape.btnPlus} onPress={() => addPoint('b')}>
                <Text style={landscape.btnPlusText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={landscape.divider} />

          {/* Right panel: set history + done */}
          <View style={landscape.rightPanel}>
            {(setScores.length > 1 || matchOver) && (
              <View style={landscape.history}>
                <Text style={landscape.historyTitle}>Set History</Text>
                {(matchOver ? setScores : setScores.slice(0, -1)).map((s, i) => (
                  <Text key={i} style={landscape.historyRow}>
                    Set {i + 1}: {s.a}–{s.b}
                  </Text>
                ))}
              </View>
            )}
            <View style={{ flex: 1 }} />
            <TouchableOpacity style={landscape.doneBtn} onPress={handleDone}>
              <Text style={landscape.doneBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>

        {saveDialog}
      </View>
    );
  }

  return (
    <View style={portrait.container}>
      <Text style={portrait.setLabel}>
        Set {currentSet + 1}{isFinalSet ? ' (Final)' : ''}
      </Text>

      {matchOver && (
        <View style={portrait.winnerBanner}>
          <Text style={portrait.winnerText}>
            {winner === 'draw' ? 'Match ends in a draw!' : `${winner} wins the match!`}
          </Text>
        </View>
      )}

      <View style={portrait.scoreboard}>
        {/* Team A */}
        <View style={portrait.teamColumn}>
          <Text style={[portrait.teamName, { color: '#4caf50' }]}>{teamAName}</Text>
          <Text style={portrait.setsWon}>Sets: {setsWon.a}</Text>
          <Text style={[portrait.score, { color: '#4caf50' }]}>{currentScore.a}</Text>
          <TouchableOpacity style={portrait.btn} onPress={() => addPoint('a')}>
            <Text style={portrait.btnText}>+</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[portrait.btn, portrait.btnMinus]} onPress={() => removePoint('a')}>
            <Text style={[portrait.btnText, portrait.btnMinusText]}>−</Text>
          </TouchableOpacity>
        </View>

        <View style={portrait.divider} />

        {/* Team B */}
        <View style={portrait.teamColumn}>
          <Text style={[portrait.teamName, { color: '#ef5350' }]}>{teamBName}</Text>
          <Text style={portrait.setsWon}>Sets: {setsWon.b}</Text>
          <Text style={[portrait.score, { color: '#ef5350' }]}>{currentScore.b}</Text>
          <TouchableOpacity style={portrait.btn} onPress={() => addPoint('b')}>
            <Text style={portrait.btnText}>+</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[portrait.btn, portrait.btnMinus]} onPress={() => removePoint('b')}>
            <Text style={[portrait.btnText, portrait.btnMinusText]}>−</Text>
          </TouchableOpacity>
        </View>
      </View>

      {(setScores.length > 1 || matchOver) && (
        <View style={portrait.history}>
          <Text style={portrait.historyTitle}>Set History</Text>
          {(matchOver ? setScores : setScores.slice(0, -1)).map((s, i) => (
            <Text key={i} style={portrait.historyRow}>
              Set {i + 1}: {teamAName} {s.a} – {s.b} {teamBName}
            </Text>
          ))}
        </View>
      )}

      <TouchableOpacity style={portrait.resetBtn} onPress={handleDone}>
        <Text style={portrait.resetText}>Done</Text>
      </TouchableOpacity>

      {saveDialog}
    </View>
  );
}

const portrait = StyleSheet.create({
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
    lineHeight: 30,
    height: 90,
    textAlignVertical: 'top',
    textAlign: 'center',
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

const landscape = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 8,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 8,
  },
  setLabel: {
    color: '#a0a0c0',
    fontSize: 14,
  },
  winnerBanner: {
    backgroundColor: '#f0c040',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  winnerText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1a1a2e',
  },
  mainRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  teamSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  teamName: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 26,
    height: 78,
    textAlignVertical: 'top',
    textAlign: 'center',
    marginBottom: 2,
  },
  setsWon: {
    color: '#a0a0c0',
    fontSize: 13,
    marginBottom: 10,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  score: {
    fontSize: 160,
    fontWeight: 'bold',
    lineHeight: 176,
    minWidth: 160,
    textAlign: 'center',
  },
  btnPlus: {
    backgroundColor: '#16213e',
    borderColor: '#4a90d9',
    borderWidth: 2,
    borderRadius: 50,
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPlusText: {
    color: '#ffffff',
    fontSize: 28,
    lineHeight: 32,
  },
  btnMinus: {
    backgroundColor: '#16213e',
    borderColor: '#c04040',
    borderWidth: 2,
    borderRadius: 50,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnMinusText: {
    color: '#ffffff',
    fontSize: 18,
    lineHeight: 22,
  },
  divider: {
    width: 2,
    alignSelf: 'stretch',
    backgroundColor: '#333355',
    marginHorizontal: 12,
  },
  rightPanel: {
    width: 130,
    alignSelf: 'stretch',
    alignItems: 'center',
    paddingVertical: 4,
  },
  history: {
    alignItems: 'center',
  },
  historyTitle: {
    color: '#a0a0c0',
    fontSize: 12,
    marginBottom: 4,
  },
  historyRow: {
    color: '#c0c0e0',
    fontSize: 12,
    marginBottom: 2,
    textAlign: 'center',
  },
  doneBtn: {
    backgroundColor: '#333355',
    borderRadius: 8,
    paddingVertical: 10,
    width: '100%',
    alignItems: 'center',
  },
  doneBtnText: {
    color: '#e0e0e0',
    fontSize: 15,
  },
});

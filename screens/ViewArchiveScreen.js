import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ARCHIVE_KEY } from './MatchHistoryScreen';

function formatDate(isoString) {
  const d = new Date(isoString);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatSets(sets) {
  return sets.map((s) => `${s.a}–${s.b}`).join(', ');
}

export default function ViewArchiveScreen({ route }) {
  const { archiveId } = route.params;
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    async function load() {
      const raw = await AsyncStorage.getItem(ARCHIVE_KEY);
      const archives = raw ? JSON.parse(raw) : [];
      const archive = archives.find((a) => a.id === archiveId);
      setMatches(archive ? archive.matches : []);
    }
    load();
  }, [archiveId]);

  return (
    <View style={styles.container}>
      {matches.length === 0 ? (
        <Text style={styles.empty}>No matches in this archive.</Text>
      ) : (
        <ScrollView style={styles.list}>
          {matches.map((match) => (
            <View key={match.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.teams}>{match.teamA} vs {match.teamB}</Text>
                <Text style={styles.date}>{formatDate(match.date)}</Text>
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
});

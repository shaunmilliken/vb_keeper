import { useCallback, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ARCHIVE_KEY } from './MatchHistoryScreen';

function formatDate(isoString) {
  const d = new Date(isoString);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function ArchiveListScreen({ navigation }) {
  const [archives, setArchives] = useState([]);

  useFocusEffect(
    useCallback(() => {
      async function load() {
        const raw = await AsyncStorage.getItem(ARCHIVE_KEY);
        setArchives(raw ? JSON.parse(raw) : []);
      }
      load();
    }, [])
  );

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
              <Text style={styles.name}>{archive.name}</Text>
              <View style={styles.meta}>
                <Text style={styles.metaText}>{archive.matches.length} match{archive.matches.length !== 1 ? 'es' : ''}</Text>
                <Text style={styles.metaText}>{formatDate(archive.date)}</Text>
              </View>
            </TouchableOpacity>
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
  name: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaText: {
    color: '#a0a0c0',
    fontSize: 13,
  },
});

import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Linking, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function AboutScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* App identity */}
      <View style={styles.header}>
        <Image source={require('../assets/vb_keeper_icon.png')} style={styles.icon} />
        <Text style={styles.appName}>VB Keeper</Text>
        <Text style={styles.version}>Version 1.0.0</Text>
        <Text style={styles.description}>
          A volleyball scorekeeping app for tracking live match scores, set history, and season results.
        </Text>
      </View>

      <View style={styles.divider} />

      {/* Developer */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Developer</Text>
        <Text style={styles.bodyText}>Shaun Milliken</Text>
        <TouchableOpacity
          style={styles.linkRow}
          onPress={() => Linking.openURL('https://github.com/shaunmilliken/vb_keeper')}
        >
          <Ionicons name="logo-github" size={18} color="#4a90d9" style={styles.linkIcon} />
          <Text style={styles.linkText}>github.com/shaunmilliken/vb_keeper</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      {/* License */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>License</Text>
        <Text style={styles.bodyText}>GNU General Public License v3.0</Text>
        <Text style={styles.licenseText}>
          Copyright © 2026 Shaun Milliken{'\n\n'}
          This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.{'\n\n'}
          This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
        </Text>
        <TouchableOpacity
          style={styles.linkRow}
          onPress={() => Linking.openURL('https://www.gnu.org/licenses/gpl-3.0.html')}
        >
          <Ionicons name="open-outline" size={18} color="#4a90d9" style={styles.linkIcon} />
          <Text style={styles.linkText}>gnu.org/licenses/gpl-3.0</Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  content: {
    paddingHorizontal: 28,
    paddingTop: 32,
    paddingBottom: 48,
  },
  header: {
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    width: 80,
    height: 80,
    borderRadius: 18,
    marginBottom: 16,
  },
  appName: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  version: {
    color: '#a0a0c0',
    fontSize: 14,
    marginBottom: 16,
  },
  description: {
    color: '#c0c0e0',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  divider: {
    height: 1,
    backgroundColor: '#2a2a4a',
    marginVertical: 28,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    color: '#a0a0c0',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  bodyText: {
    color: '#ffffff',
    fontSize: 16,
  },
  licenseText: {
    color: '#a0a0c0',
    fontSize: 13,
    lineHeight: 20,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  linkIcon: {
    marginRight: 8,
  },
  linkText: {
    color: '#4a90d9',
    fontSize: 14,
  },
});

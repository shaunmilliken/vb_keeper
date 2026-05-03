import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from './screens/HomeScreen';
import ScoreScreen from './screens/ScoreScreen';
import SettingsScreen from './screens/SettingsScreen';
import MatchHistoryScreen from './screens/MatchHistoryScreen';
import MatchSettingsScreen from './screens/MatchSettingsScreen';
import ArchiveListScreen from './screens/ArchiveListScreen';
import ViewArchiveScreen from './screens/ViewArchiveScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: { backgroundColor: '#1a1a2e' },
          headerTintColor: '#ffffff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="MatchSettings" component={MatchSettingsScreen} options={{ title: 'Match Settings' }} />
        <Stack.Screen name="Score" component={ScoreScreen} options={{ title: 'Scoreboard' }} />
        <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
        <Stack.Screen name="MatchHistory" component={MatchHistoryScreen} options={{ title: 'Match History' }} />
        <Stack.Screen name="ArchiveList" component={ArchiveListScreen} options={{ title: 'Archives' }} />
        <Stack.Screen name="ViewArchive" component={ViewArchiveScreen} options={({ route }) => ({ title: route.params.name ?? 'Archive' })} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

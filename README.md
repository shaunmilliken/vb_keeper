# VB Keeper

A volleyball scorekeeping app for tracking live match scores, set history, and season results.

Built with Expo (React Native), targeting iOS and Android.

## Features

- **Live scorekeeping** — rally scoring with +/− buttons; portrait and landscape layouts
- **Set history** — previous set scores shown inline during a match
- **Match history** — save results after each match; delete individual records
- **Season archives** — archive the current match history under a season name for long-term record keeping
- **Configurable defaults** — set team names, number of sets (2/3/5), and start score (0 or 4) in Settings
- **Per-match overrides** — adjust team names and rules before each match without changing your saved defaults

## Volleyball Rules

- Rally scoring: sets go to 25, win by 2
- Final set goes to 15, win by 2, and always starts at 0–0
- 2-set match mode: winner is determined by sets won; ties result in a draw
- The − button floors at 0 (not start score) to allow score corrections

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- iOS Simulator (requires Mac) or Android Emulator, or the Expo Go app on a physical device

### Install

```bash
npm install
```

### Run

```bash
npx expo start          # start dev server
npx expo start --ios    # open in iOS simulator
npx expo start --android  # open in Android emulator
npx expo start --web    # open in browser (web preview)
```

## Project Structure

```
App.js                  # Navigation stack (entry point)
screens/
  HomeScreen.js         # Landing screen
  MatchSettingsScreen.js  # Per-match configuration
  ScoreScreen.js        # Live scoreboard
  SettingsScreen.js     # App defaults and data management
  MatchHistoryScreen.js # Saved match results
  ArchiveListScreen.js  # Archived seasons list
  ViewArchiveScreen.js  # Matches within an archive
  AboutScreen.js        # App info and license
```

## Tech Stack

- [Expo](https://expo.dev/) ~55
- [React Native](https://reactnative.dev/) 0.83
- [React Navigation](https://reactnavigation.org/) v7
- [@react-native-async-storage/async-storage](https://github.com/react-native-async-storage/async-storage) — local persistence
- [expo-screen-orientation](https://docs.expo.dev/versions/latest/sdk/screen-orientation/) — landscape support on the scoreboard
- [@expo/vector-icons](https://docs.expo.dev/guides/icons/) (Ionicons)

## License

GNU General Public License v3.0 — see [LICENSE](https://www.gnu.org/licenses/gpl-3.0.html) for details.

Copyright © 2026 Shaun Milliken

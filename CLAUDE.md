# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npx expo start        # start dev server (then press w to open in browser)
npx expo start --ios  # open in iOS simulator (requires Mac)
```

There are no tests or linter configured in this project.

## Architecture

This is an **Expo (React Native)** app targeting iOS and Android, with web preview support via `npx expo start --web`.

### Navigation

`App.js` is the entry point and contains only the React Navigation stack. All screens are registered there. The navigation stack is:

```
Home → MatchSettings → Score
Home → MatchHistory
Home → Settings
```

### Screens (`screens/`)

| File | Purpose |
|---|---|
| `HomeScreen.js` | Landing screen with buttons to start a match, view history, or open settings |
| `MatchSettingsScreen.js` | Per-match config (team names, # of sets, start score) shown before every match; pre-fills from saved defaults |
| `ScoreScreen.js` | Live scorekeeping; receives all match config as **route params** from MatchSettings |
| `SettingsScreen.js` | Persistent app defaults saved to AsyncStorage; also contains the "Delete Match History" action |
| `MatchHistoryScreen.js` | Reads and displays saved match records from AsyncStorage |

### Data flow

- **Settings** (team names, # of sets, start score) are persisted via `AsyncStorage` in `SettingsScreen.js`, which also exports `SETTINGS_KEYS` and `DEFAULTS` used by other screens.
- **Match config** flows from `MatchSettingsScreen` → `ScoreScreen` as React Navigation route params. `ScoreScreen` does not read from AsyncStorage.
- **Match history** is stored as a JSON array under `MATCH_HISTORY_KEY` (exported from `ScoreScreen.js`). Records are written by `ScoreScreen` and read/deleted by `MatchHistoryScreen` and `SettingsScreen`.

### Volleyball rules implemented

- Rally scoring: sets go to 25, win by 2; final set goes to 15, win by 2.
- "Final set" is always index `maxSets - 1` where `maxSets = setsToWin * 2 - 1`.
- The final set always starts at 0–0 regardless of the `startScore` setting.
- The `−` button floors at 0 (not at `startScore`) to allow score correction.

### UI conventions

- Dark theme throughout: background `#1a1a2e`, card background `#16213e`.
- Team A is colored green (`#4caf50`), Team B red (`#ef5350`).
- Confirmations use a custom `Modal` component (not `Alert`) for web compatibility.
- `@expo/vector-icons` (`Ionicons`) is available without additional installation.

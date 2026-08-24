# Trainero

Kostenlose, native iOS-Trainings-App: persönlicher Trainingswochenplan basierend auf
Zielen, Erfahrung, verfügbarem Equipment und Zeitbudget – komplett offline, alle Daten
bleiben lokal auf dem Gerät.

## Tech-Stack

- **Expo (SDK 57) + React Native + TypeScript**
- **expo-router** (dateibasiertes Routing, native Navigation über `react-native-screens`)
- **AsyncStorage** für dauerhafte, lokale Datenspeicherung (kein Backend, kein Server)
- Ein selbst geschriebener, regelbasierter **Trainingsplan-Generator** (kein KI-Call,
  läuft komplett offline und deterministisch)

## Projektstruktur

```
app/                     Screens & Navigation (expo-router, dateibasiert)
  _layout.tsx             Root-Layout: Provider, Splash-Screen, Stack-Navigation
  index.tsx                Einstiegs-Weiche: Onboarding vs. Haupt-App
  onboarding/               Mehrstufiger Einrichtungs-Assistent
  (tabs)/                    Haupt-App: Heute / Plan / Fortschritt / Profil
  workout/[dayId].tsx          Trainings-Session (Sätze abhaken)
  exercise/[id].tsx             Übungs-Detailansicht

src/
  components/             Wiederverwendbare UI-Bausteine
  data/exercises.ts        Lokale Übungsdatenbank
  lib/
    planGenerator.ts         Kern-Algorithmus: Profil → Trainingsplan
    storage.ts                 Typisierter AsyncStorage-Wrapper
    stats.ts                     Streak-/Fortschritts-Berechnung
  store/                   React-Context (App-State & Onboarding-Wizard-State)
  theme/                   Farben, Abstände, Typografie
  types/                   Zentrale TypeScript-Typen
  utils/                   Kleine Helfer (IDs, Datum)

assets/                  App-Icon, Splash-Icon, Adaptive-Icon (Platzhalter-Design)
scripts/generate-icons.js  Erzeugt die Platzhalter-Icons ohne externe Bildtools
app.json / eas.json      Expo- & EAS-Build-Konfiguration
```

Die App merkt sich alles dauerhaft (Profil, Plan, Trainingsverlauf) über
`AsyncStorage` – kein Login, kein Server, funktioniert vollständig offline.

---

## 1. Lokal entwickeln & testen

Voraussetzung: Node.js (bereits vorhanden), npm.

```bash
npm install
npx expo start
```

Am schnellsten testest du auf deinem eigenen iPhone mit der kostenlosen **Expo Go**
App aus dem App Store: QR-Code aus dem Terminal scannen, fertig. Für den finalen
Store-Build brauchst du das nicht – aber zur schnellen Entwicklung ist es ideal.

```bash
npm run typecheck   # TypeScript-Check ohne zu bauen
```

---

## 2. Voraussetzungen für die Store-Veröffentlichung

1. **Apple Developer Program** Mitgliedschaft (99 $/Jahr) – ohne die geht weder
   TestFlight noch App Store Veröffentlichung. Registrierung: https://developer.apple.com/programs/
2. Ein kostenloser **Expo/EAS Account**: https://expo.dev/signup
3. **EAS CLI** installieren (einmalig, global):
   ```bash
   npm install -g eas-cli
   ```

Ein Mac mit Xcode ist **nicht nötig** – EAS Build kompiliert die iOS-App in der
Cloud und liefert dir eine fertige `.ipa`-Datei bzw. lädt direkt zu TestFlight hoch.

---

## 3. Projekt mit deinem Expo-Account verknüpfen

```bash
eas login
eas init
```

`eas init` erstellt ein Projekt in deinem Expo-Account und trägt die echte
`projectId` automatisch in `app.json` unter `extra.eas.projectId` ein (ersetzt den
Platzhalter `REPLACE_WITH_EAS_PROJECT_ID`).

**Bundle-ID prüfen:** In `app.json` steht aktuell `com.mendlerbro.trainero` (iOS)
bzw. `com.mendlerbro.trainero` (Android). Ändere das auf eine eigene, eindeutige
ID, z. B. `com.<deinname>.trainero`, bevor du das erste Mal baust – das ist die
dauerhafte, nicht mehr änderbare App-Kennung im App Store.

---

## 4. iOS-Build erstellen

Für den ersten Build fragt EAS automatisch nach deinen Apple-Zugangsdaten und
verwaltet Zertifikate/Provisioning-Profile für dich (empfohlen – keine manuelle
Zertifikatsverwaltung nötig).

**Test-Build für TestFlight:**
```bash
eas build --platform ios --profile preview
```

**Produktions-Build (für den finalen Store-Release):**
```bash
eas build --platform ios --profile production
```

Der Build läuft in der Cloud (dauert ca. 10–20 Minuten). Am Ende bekommst du einen
Link zur fertigen `.ipa`-Datei sowie einen Link zum Build-Dashboard.

---

## 5. Auf dein iPhone bringen: TestFlight

1. **In App Store Connect eine App anlegen:** https://appstoreconnect.apple.com →
   *Meine Apps* → *+* → *Neue App*. Bundle-ID aus Schritt 3 auswählen, Name z. B.
   „Trainero" vergeben.
2. **Build hochladen:**
   ```bash
   eas submit --platform ios --profile production
   ```
   Trage vorher in `eas.json` unter `submit.production.ios` deine echten Werte ein:
   - `appleId`: deine Apple-ID-E-Mail
   - `ascAppId`: die App-ID aus App Store Connect (in den App-Infos zu finden)
   - `appleTeamId`: deine Team-ID aus dem Apple Developer Portal
3. **Warten:** Apple verarbeitet den Build (Processing), das dauert meist
   15–60 Minuten. Du bekommst eine E-Mail, sobald er fertig ist.
4. **TestFlight-Tab in App Store Connect:** Build erscheint unter *Interne Tests*.
   Trage dich selbst (deine Apple-ID) als internen Tester ein.
5. **Auf dem iPhone:** Kostenlose **TestFlight**-App aus dem App Store installieren,
   einloggen, App erscheint automatisch zur Installation.

Ab hier kannst du die App wie eine normale App auf deinem iPhone nutzen und bei
jedem neuen Build direkt über TestFlight aktualisieren.

---

## 6. Im App Store veröffentlichen

Sobald du mit der App zufrieden bist:

1. In App Store Connect unter deiner App die **App-Store-Seite** ausfüllen:
   Screenshots (verschiedene iPhone-Größen), Beschreibung, Schlüsselwörter,
   Kategorie (z. B. „Gesundheit & Fitness"), Support-URL.
2. **Datenschutzerklärung (Pflicht):** Auch wenn die App keinerlei Daten an einen
   Server sendet, verlangt Apple eine öffentlich erreichbare Datenschutz-URL. Eine
   einfache statische Seite (z. B. via GitHub Pages) reicht aus – Kerninhalt: *„Diese
   App speichert alle Daten ausschließlich lokal auf deinem Gerät. Es werden keine
   Daten an Server Dritter übertragen."*
3. **App Privacy-Fragebogen** in App Store Connect ausfüllen: Da die App keinerlei
   Daten sammelt oder überträgt, kannst du durchgängig „Keine Daten erfasst" wählen.
4. Den in Schritt 5 hochgeladenen (oder einen neuen Produktions-)Build der
   Store-Version zuweisen.
5. **Zur Prüfung einreichen.** Apples Review dauert in der Regel 1–3 Tage.

Nach Freigabe ist die App live im App Store.

---

## 7. Spätere Updates veröffentlichen

Bei jeder neuen Version:

```bash
# Versionsnummer in app.json anpassen (z. B. "1.1.0"),
# dann neu bauen und hochladen:
eas build --platform ios --profile production
eas submit --platform ios --profile production
```

Die Build-Nummer (`ios.buildNumber`) wird durch `autoIncrement: true` in
`eas.json` automatisch hochgezählt – darum musst du dich nicht kümmern.

---

## Design-Hinweis zu den Icons

`assets/icon.png`, `assets/splash-icon.png` etc. sind mit `scripts/generate-icons.js`
erzeugte, schlichte Platzhalter-Icons (Dumbbell-Symbol, dunkles Theme). Ersetze sie
vor der finalen Veröffentlichung gerne durch ein eigenes Design – einfach die
gleichnamigen PNG-Dateien in `assets/` austauschen, an den vorhandenen Maßen
(1024×1024 für App-Icon) orientieren.

## Nächste sinnvolle Ausbaustufen

Die Struktur ist bewusst so gehalten, dass sich Folgendes später leicht ergänzen
lässt, ohne Bestehendes umzubauen:

- Gewichts-/Wiederholungs-Tracking pro Satz (Datenmodell `CompletedSet` ist bereits
  darauf vorbereitet)
- Push-Erinnerungen an Trainingstage
- Körpermaße/Gewichtsverlauf-Tracking
- Übungs-Videos oder -Bilder (aktuell rein textbasiert, um die App klein & schnell
  zu halten)

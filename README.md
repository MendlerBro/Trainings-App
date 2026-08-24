# Trainero

Kostenlose, native iOS-Trainings-App: persönlicher Trainingswochenplan basierend auf
Zielen, Erfahrung, verfügbarem Equipment und Zeitbudget. Login mit Apple oder Google,
alle Daten werden sicher mit deinem Account in der Cloud gespeichert (Firebase) und
zusätzlich lokal gecacht, damit die App auch offline nutzbar bleibt.

## Tech-Stack

- **Expo (SDK 57) + React Native + TypeScript**
- **expo-router** (dateibasiertes Routing, native Navigation über `react-native-screens`)
- **Firebase Authentication** – Login ausschließlich über **Sign in with Apple** und
  **Google Sign-In** (kein Passwort, kein eigenes Nutzerkonto-System)
- **Cloud Firestore** – Profil, Trainingsplan & Trainingsverlauf, an den Account
  gebunden, geräteübergreifend synchronisiert
- **AsyncStorage** als lokaler Offline-Cache (App funktioniert auch ohne Internet;
  Änderungen werden synchronisiert, sobald wieder eine Verbindung besteht)
- Ein selbst geschriebener, regelbasierter **Trainingsplan-Generator** (kein KI-Call,
  läuft komplett offline und deterministisch)

## Projektstruktur

```
app/                     Screens & Navigation (expo-router, dateibasiert)
  _layout.tsx             Root-Layout: Provider, Splash-Screen, Stack-Navigation
  index.tsx                Einstiegs-Weiche: Login vs. Onboarding vs. Haupt-App
  login.tsx                 Anmeldung mit Apple / Google
  onboarding/               Mehrstufiger Einrichtungs-Assistent
  (tabs)/                    Haupt-App: Heute / Plan / Fortschritt / Profil
  workout/[dayId].tsx          Trainings-Session (Sätze abhaken)
  exercise/[id].tsx             Übungs-Detailansicht

src/
  components/             Wiederverwendbare UI-Bausteine
  data/exercises.ts        Lokale Übungsdatenbank
  lib/
    firebase.ts               Firebase-Initialisierung (Auth + Firestore)
    cloudSync.ts               Firestore-Lese-/Schreib-Helfer (Echtzeit-Sync)
    planGenerator.ts            Kern-Algorithmus: Profil → Trainingsplan
    storage.ts                   Typisierter, pro Account getrennter AsyncStorage-Cache
    stats.ts                      Streak-/Fortschritts-Berechnung
  store/
    AuthContext.tsx            Login-Status, Apple-/Google-Sign-In
    AppContext.tsx              Profil/Plan/Verlauf inkl. Cloud-Sync
    OnboardingContext.tsx        Zwischenstand des Einrichtungs-Assistenten
  theme/                   Farben, Abstände, Typografie
  types/                   Zentrale TypeScript-Typen
  utils/                   Kleine Helfer (IDs, Datum)

assets/                  App-Icon, Splash-Icon, Adaptive-Icon (Platzhalter-Design)
scripts/generate-icons.js  Erzeugt die Platzhalter-Icons ohne externe Bildtools
app.config.ts / eas.json  Expo- & EAS-Build-Konfiguration
firestore.rules          Sicherheitsregeln: jede/r Nutzer:in sieht nur die eigenen Daten
```

**Wie die Daten fließen:** Jede Änderung (Onboarding abschließen, Profil anpassen,
Training abschließen) wird sofort lokal gespeichert (funktioniert offline) *und* im
Hintergrund nach Firestore geschrieben. Beim Login liest die App per Echtzeit-Listener
den aktuellen Stand aus Firestore – meldest du dich auf einem zweiten Gerät an, siehst
du sofort deinen Plan und Verlauf.

---

## 1. Lokal entwickeln & testen

Voraussetzung: Node.js (bereits vorhanden), npm.

```bash
npm install
```

**Wichtig:** Apple-/Google-Login sind native Module – sie funktionieren **nicht** in
der normalen Expo-Go-App. Zum Testen brauchst du einen eigenen **Development Build**
(`expo-dev-client` ist bereits als Abhängigkeit im Projekt enthalten):

```bash
eas build --platform ios --profile development
```

Den fertigen Build lädst du dir wie in Abschnitt 6 beschrieben über einen Link aufs
iPhone. Danach startest du den JS-Bundler ganz normal:

```bash
npx expo start
npm run typecheck   # TypeScript-Check ohne zu bauen
```

---

## 2. Firebase & Login einrichten

Ohne diesen Schritt startet die App bis zum Login-Screen, die Anmeldung schlägt aber
fehl (die Konsole zeigt eine klare Warnung, wenn `.env` fehlt).

### 2.1 Firebase-Projekt anlegen

1. Auf https://console.firebase.google.com ein neues, kostenloses Projekt anlegen.
2. **Authentication → Sign-in method** aktivieren:
   - **Apple** aktivieren (kein zusätzlicher Schlüssel nötig für die Basis-Nutzung).
   - **Google** aktivieren.
3. **Firestore Database** anlegen (Produktionsmodus).
4. **Projekteinstellungen → Deine Apps → Web-App hinzufügen** (das „Web"-Symbol reicht
   aus, auch für eine reine iOS-App – daraus kommt die SDK-Konfiguration). Die
   angezeigten Werte (`apiKey`, `authDomain`, `projectId`, …) in deine `.env`
   eintragen (siehe `.env.example`).

### 2.2 Google Sign-In konfigurieren

1. In der [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   deines Firebase-Projekts unter *APIs & Dienste → Anmeldedaten* zwei
   OAuth-2.0-Client-IDs erstellen (Firebase legt beim Aktivieren von Google-Login
   meist automatisch einen „Web"-Client an):
   - **Web-Client** → `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`
   - **iOS-Client** (Bundle-ID `com.mendlerbro.trainero` bzw. deine eigene) → davon
     die **REVERSED_CLIENT_ID** (Format `com.googleusercontent.apps.xxxxx`) in
     `EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME` eintragen.
2. `.env` aus `.env.example` erstellen und alle Werte eintragen:
   ```bash
   cp .env.example .env
   ```

### 2.3 Sign in with Apple aktivieren

1. Im [Apple Developer Portal](https://developer.apple.com/account/resources/identifiers/list)
   bei deiner App-ID (Bundle-ID) die Capability **„Sign In with Apple"** aktivieren.
   (Braucht die kostenpflichtige Apple Developer Mitgliedschaft, siehe Abschnitt 3.)
2. Kein zusätzlicher Code nötig – die App fordert die Berechtigung automatisch über
   `expo-apple-authentication` an (Entitlement wird beim Build automatisch gesetzt).

### 2.4 Firestore-Sicherheitsregeln setzen

In der Firebase Console unter **Firestore → Regeln** den Inhalt von `firestore.rules`
einfügen und veröffentlichen. Das stellt sicher, dass jede Person ausschließlich ihre
eigenen Daten lesen/schreiben kann.

---

## 3. Voraussetzungen für die Store-Veröffentlichung

1. **Apple Developer Program** Mitgliedschaft (99 $/Jahr) – ohne die geht weder
   Sign in with Apple im Produktions-Build noch TestFlight noch App Store
   Veröffentlichung. Registrierung: https://developer.apple.com/programs/
2. Ein kostenloser **Expo/EAS Account**: https://expo.dev/signup
3. **EAS CLI** installieren (einmalig, global):
   ```bash
   npm install -g eas-cli
   ```

Ein Mac mit Xcode ist **nicht nötig** – EAS Build kompiliert die iOS-App in der
Cloud und liefert dir eine fertige `.ipa`-Datei bzw. lädt direkt zu TestFlight hoch.

---

## 4. Projekt mit deinem Expo-Account verknüpfen

```bash
eas login
eas init
```

`eas init` erstellt ein Projekt in deinem Expo-Account und trägt die echte
`projectId` automatisch in `app.config.ts` unter `extra.eas.projectId` ein (ersetzt
den Platzhalter `REPLACE_WITH_EAS_PROJECT_ID`).

**Bundle-ID prüfen:** In `app.config.ts` steht aktuell `com.mendlerbro.trainero`
(iOS und Android). Ändere das auf eine eigene, eindeutige ID, z. B.
`com.<deinname>.trainero`, bevor du das erste Mal baust – das ist die dauerhafte,
nicht mehr änderbare App-Kennung im App Store. Falls du sie änderst, denk daran, die
iOS-Client-ID in Google Cloud Console für dieselbe Bundle-ID neu anzulegen.

**EAS-Umgebungsvariablen:** Damit `EAS Build` deine `.env`-Werte kennt (die Datei
selbst wird nicht committet), einmalig hochladen:
```bash
eas env:push --environment production
eas env:push --environment preview
eas env:push --environment development
```

---

## 5. iOS-Build erstellen

Für den ersten Build fragt EAS automatisch nach deinen Apple-Zugangsdaten und
verwaltet Zertifikate/Provisioning-Profile für dich (empfohlen – keine manuelle
Zertifikatsverwaltung nötig). Da die App native Module benutzt (Apple-/Google-Login),
ist ein **Development Build** zum Testen erforderlich – Expo Go reicht nicht.

**Development-Build (zum Testen während der Entwicklung):**
```bash
eas build --platform ios --profile development
```

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

## 6. Auf dein iPhone bringen: TestFlight

1. **In App Store Connect eine App anlegen:** https://appstoreconnect.apple.com →
   *Meine Apps* → *+* → *Neue App*. Bundle-ID aus Schritt 4 auswählen, Name z. B.
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

## 7. Im App Store veröffentlichen

Sobald du mit der App zufrieden bist:

1. In App Store Connect unter deiner App die **App-Store-Seite** ausfüllen:
   Screenshots (verschiedene iPhone-Größen), Beschreibung, Schlüsselwörter,
   Kategorie (z. B. „Gesundheit & Fitness"), Support-URL.
2. **Datenschutzerklärung (Pflicht):** Da die App jetzt einen Account mit Apple-/
   Google-Login sowie Cloud-Speicherung nutzt, brauchst du eine echte, öffentlich
   erreichbare Datenschutzerklärung (z. B. via GitHub Pages). Kernpunkte, die sie
   nennen sollte: welche Daten erfasst werden (E-Mail/Name aus Apple/Google-Login,
   Trainingsprofil und -verlauf), dass sie über Firebase (Google) verarbeitet und
   gespeichert werden, und wie Nutzer:innen eine Löschung verlangen können.
3. **App Privacy-Fragebogen** in App Store Connect ausfüllen: Erfasst werden u. a.
   *Kontaktinformationen* (E-Mail) und *Nutzungsdaten* (Trainingsverlauf) – jeweils
   verknüpft mit dem Nutzerkonto, nicht zu Werbezwecken. Genaue Kategorien im
   Fragebogen entsprechend ankreuzen.
4. **Sign in with Apple ist verpflichtend**, weil die App auch Google-Login anbietet
   (Apple App Store Richtlinie 4.8) – das ist in dieser App bereits erfüllt.
5. Den in Schritt 6 hochgeladenen (oder einen neuen Produktions-)Build der
   Store-Version zuweisen.
6. **Zur Prüfung einreichen.** Apples Review dauert in der Regel 1–3 Tage.

Nach Freigabe ist die App live im App Store.

---

## 8. Spätere Updates veröffentlichen

Bei jeder neuen Version:

```bash
# Versionsnummer in app.config.ts anpassen (z. B. "1.1.0"),
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
(1024×1024 für App-Icon) orientieren. Der Google-Anmelde-Button auf dem Login-Screen
verwendet aktuell ein einfaches „G" als Platzhalter statt des offiziellen
Google-Logos – für die finale Veröffentlichung empfiehlt es sich, das offizielle
Asset gemäß Googles Markenrichtlinien einzusetzen.

## Nächste sinnvolle Ausbaustufen

Die Struktur ist bewusst so gehalten, dass sich Folgendes später leicht ergänzen
lässt, ohne Bestehendes umzubauen:

- Gewichts-/Wiederholungs-Tracking pro Satz (Datenmodell `CompletedSet` ist bereits
  darauf vorbereitet)
- Push-Erinnerungen an Trainingstage
- Körpermaße/Gewichtsverlauf-Tracking
- Übungs-Videos oder -Bilder (aktuell rein textbasiert, um die App klein & schnell
  zu halten)
- Account-Löschung direkt in der App (aktuell nur über die Firebase Console möglich)

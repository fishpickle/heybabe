# HeyBabe 🍼

A family task manager built with **Expo + React Native + TypeScript**.  
Supports **persistent tasks** (via AsyncStorage), **global state** (via React Context), and **modal-based navigation** (via Expo Router).  

---

## 🚀 Features
- Add, edit, delete, and complete tasks
- Tasks persist across app reloads (AsyncStorage)
- Clean navigation with **Expo Router modals**
- Global state management with Context + Reducer
- Type-safe with TypeScript
- Ready to extend with Firestore for multi-device sync

---

## 📂 Project Structure
```
app/
  (tabs)/
    tasks.tsx        # Main tasks screen
  (modals)/
    AddTaskModal.tsx
    TaskDetailModal.tsx
    _layout.tsx       # Modal presentation config
components/
  TaskCard.tsx
context/
  TasksContext.tsx    # Global state + AsyncStorage persistence
types/
  taskTypes.ts
utils/
  taskHelpers.ts
```

---

## 🛠️ Getting Started

### 1. Install dependencies
```bash
npm install
# or
yarn install
```

### 2. Start the development server
```bash
npx expo start
```

### 3. Run on device/simulator
- **iOS**: Press `i` in the terminal  
- **Android**: Press `a` in the terminal  
- **Web**: Press `w` in the terminal  

---

## 📱 TestFlight / External Testing
1. Bump the version in `app.json`:
   ```json
   {
     "expo": {
       "version": "1.1.0",
       "ios": { "buildNumber": "2" },
       "android": { "versionCode": 2 }
     }
   }
   ```
2. Build for iOS:
   ```bash
   eas build -p ios --profile production
   ```
3. Upload to App Store Connect:
   ```bash
   eas submit -p ios --latest
   ```
4. Add testers via App Store Connect → TestFlight.  

---

## 🔮 Roadmap
- [ ] Firestore sync for multi-user tasks
- [ ] User authentication (Firebase Auth)
- [ ] Push notifications for due tasks
- [ ] Repeat tasks with custom schedules
- [ ] Attachments (photos, notes)

---

## 📝 License
MIT License. See [LICENSE](LICENSE) for details.

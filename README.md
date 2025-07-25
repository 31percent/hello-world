# 🎴 Poker Live - Joc de Poker în Timp Real cu Autentificare Twitter

O aplicație web modernă de poker Texas Hold'em unde te poți conecta cu contul de Twitter și juca cu prietenii în timp real!

## ✨ Caracteristici

- 🔐 **Autentificare Twitter OAuth** - Conectare rapidă și sigură
- 🎮 **Poker în timp real** - Joc live cu Socket.IO
- 👥 **Până la 6 jucători** per masă
- 💬 **Chat live** - Comunicare în timp real între jucători
- 🃏 **Texas Hold'em complet** - Reguli complete de poker
- 📱 **Responsive design** - Funcționează pe desktop și mobil
- 🎯 **Interface modernă** - Design frumos și intuitiv

## 🚀 Instalare și Configurare

### Cerințe preliminare

- Node.js (v16 sau mai nou)
- npm sau yarn
- Cont Twitter Developer pentru OAuth

### Pasul 1: Clone repository-ul

```bash
git clone <repository-url>
cd poker-live-twitter
```

### Pasul 2: Instalează dependențele

```bash
# Instalează dependențele pentru toate proiectele
npm run install:all

# SAU instalează manual:
npm install
cd server && npm install
cd ../client && npm install
```

### Pasul 3: Configurează Twitter OAuth

1. Mergi la [Twitter Developer Portal](https://developer.twitter.com)
2. Creează o aplicație nouă
3. Obține `Consumer Key` și `Consumer Secret`
4. Adaugă callback URL: `http://localhost:3001/auth/twitter/callback`

### Pasul 4: Configurează variabilele de mediu

```bash
# În directorul server/
cp .env.example .env
```

Editează `server/.env` cu valorile tale:

```env
PORT=3001
NODE_ENV=development

# Twitter OAuth (obține de la developer.twitter.com)
TWITTER_CONSUMER_KEY=your_twitter_consumer_key
TWITTER_CONSUMER_SECRET=your_twitter_consumer_secret

# Session Secret (generează unul aleatoriu)
SESSION_SECRET=your_very_secure_session_secret

# Client URL
CLIENT_URL=http://localhost:3000
```

### Pasul 5: Pornește aplicația

```bash
# Pornește atât serverul cât și clientul
npm run dev

# SAU pornește separat:
# Terminal 1 - Backend
cd server && npm run dev

# Terminal 2 - Frontend  
cd client && npm start
```

Aplicația va fi disponibilă la:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001

## 🎮 Cum să joci

1. **Conectează-te** cu contul tău de Twitter
2. **Creează un joc nou** sau **alătură-te unui joc existent**
3. **Așteaptă** ca alți jucători să se alăture (minim 2 jucători)
4. **Începe jocul** (doar creatorul poate începe)
5. **Joacă poker** folosind butoanele de acțiune:
   - **Fold** - Renunță la mână
   - **Check** - Treci fără pariu (când nu este pariu activ)
   - **Call** - Egalează pariul curent
   - **Raise** - Mărește pariul
   - **All In** - Pariază toate chipurile

## 🏗️ Arhitectura Aplicației

```
poker-live-twitter/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Componente React
│   │   ├── contexts/       # Context pentru autentificare
│   │   ├── hooks/          # Custom hooks (Socket.IO)
│   │   └── types/          # TypeScript interfaces
├── server/                 # Node.js backend
│   ├── src/
│   │   ├── config/         # Configurații (Passport)
│   │   ├── game/          # Logica jocului de poker
│   │   ├── routes/        # Rute API
│   │   └── socket/        # Socket.IO handlers
└── package.json           # Scripts pentru tot proiectul
```

## 🔧 Tehnologii Folosite

### Frontend
- **React** cu TypeScript
- **Socket.IO Client** pentru comunicarea în timp real
- **React Router** pentru navigare
- **CSS3** cu animații și gradient-uri

### Backend
- **Node.js** cu Express
- **Socket.IO** pentru comunicarea în timp real
- **Passport.js** cu Twitter OAuth
- **UUID** pentru generarea ID-urilor unice

## 🎯 Funcționalități Principale

### Autentificare
- Login/logout cu Twitter OAuth
- Gestionarea sesiunilor utilizatorilor
- Protecția rutelor

### Jocul de Poker
- **Texas Hold'em** complet implementat
- Gestionarea blindurilor (small/big blind)
- Toate acțiunile: fold, check, call, raise, all-in
- Distribuirea cărților și rundele de pariere
- Determinarea câștigătorului

### Comunicare în Timp Real
- **Socket.IO** pentru sincronizarea jocului
- Chat live între jucători
- Actualizări instantanee ale stării jocului
- Gestionarea reconectărilor

## 🎨 Design și UX

- **Interface modernă** cu tema verde de poker
- **Animații fluide** pentru cărți și acțiuni
- **Responsive design** pentru toate dispozitivele
- **Feedback vizual** pentru acțiunile jucătorilor
- **Indicatori** pentru rândul curent și dealer button

## 🐛 Dezvoltare și Debugging

### Scripts utile

```bash
# Dezvoltare cu hot reload
npm run dev

# Pornește doar serverul
npm run server:dev

# Pornește doar clientul
npm run client:dev

# Build pentru producție
npm run build
```

### Debugging

- Serverul rulează pe portul 3001
- Clientul rulează pe portul 3000
- Socket.IO logs sunt afișate în consola browserului
- Erori backend sunt afișate în terminalul serverului

## 📝 Licență

MIT License - Vezi fișierul LICENSE pentru detalii.

## 🤝 Contribuții

Contribuțiile sunt binevenite! Te rog să:

1. Faci fork la repository
2. Creezi o branch pentru feature-ul nou
3. Faci commit la schimbări
4. Deschizi un Pull Request

## 📞 Support

Pentru probleme sau întrebări, deschide un issue pe GitHub.

---

**Distrează-te jucând poker cu prietenii! 🎴🎯** 

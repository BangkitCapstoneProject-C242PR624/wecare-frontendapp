Berikut adalah versi sederhana dengan format Markdown yang cocok untuk README GitHub:

---

# Firebase Setup Guide

## Langkah-Langkah

### 1. Mengambil Firebase Credential
1. Masuk ke [Firebase Console](https://console.firebase.google.com/).
2. Klik **⚙️ Gear** di pojok kiri atas, pilih **Project Settings**.
3. Buka tab **Service Accounts**.
4. Klik tombol **Generate new private key** untuk mengunduh file credential.
5. Ubah nama file menjadi `wecareKey.json`.
6. Letakkan file tersebut di folder `config/wecareKey.json`.

**Struktur Folder:**
```
/project-root
  ├── /config
  │     └── wecareKey.json
```

### 2. Menambahkan Firebase Config
1. Di Firebase Console, buka tab **General** di **Project Settings**.
2. Gulir ke bawah ke bagian **SDK setup and configuration**, pilih **Config**, lalu salin kode konfigurasi.
3. Buka file `public/js/firebaseauth.js` di repository ini.
4. Cari komentar `// TODO: Replace this with your Firebase config`.
5. Gantikan placeholder `firebaseConfig` dengan konfigurasi yang telah disalin.

**Struktur Folder:**
```
/project-root
  ├── /public
  │     └── /js
  │           └── firebaseauth.js
```

---

## Contoh Kode

### 🔑 Credential (`wecareKey.json`)
```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "your-private-key-id",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk@your-project-id.iam.gserviceaccount.com",
  "client_id": "your-client-id",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk@your-project-id.iam.gserviceaccount.com"
}
```

### ⚙️ Firebase Config (`firebaseauth.js`)
```javascript
// TODO: Replace this with your Firebase config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
```

---

**Catatan Penting:**
- Jangan pernah mengunggah file `wecareKey.json` ke GitHub! Tambahkan ke `.gitignore`:
  ```
  /config/key.json
  ```
--- 

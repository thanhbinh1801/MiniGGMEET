// firebase.js
import fs from 'fs';
import admin from 'firebase-admin';

const serviceAccount = JSON.parse(
  fs.readFileSync(new URL('../config/firebase-adminsdk.json', import.meta.url), 'utf8')
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export default admin;

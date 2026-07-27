const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, setDoc, doc } = require('firebase/firestore');
const config = require('./firebase-applet-config.json');

const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function test() {
  try {
    await setDoc(doc(db, 'gateEntries', 'test-123'), { test: true });
    console.log("Write success!");
    const snap = await getDocs(collection(db, 'gateEntries'));
    console.log("Docs:", snap.docs.length);
  } catch (e) {
    console.error("Error:", e);
  }
}
test();

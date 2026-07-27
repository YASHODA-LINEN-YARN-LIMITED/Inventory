const fs = require('fs');
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

code = code.replace(/const addGateEntry = async \(entry: Omit<GateEntry, 'id'>\) => firestoreAdd\('gateEntriesYashoda', 'gateEntriesAIPL', entry\);/,
  "const addGateEntry = async (entry: Omit<GateEntry, 'id'>, type: 'Yashoda' | 'AIPL') => firestoreAdd(type === 'Yashoda' ? 'gateEntriesYashoda' : 'gateEntriesAIPL', entry);");

code = code.replace(/const updateGateEntry = async \(id: string, data: Partial<GateEntry>\) => firestoreUpdate\('gateEntriesYashoda', 'gateEntriesAIPL', id, data\);/,
  "const updateGateEntry = async (id: string, data: Partial<GateEntry>, type: 'Yashoda' | 'AIPL') => firestoreUpdate(type === 'Yashoda' ? 'gateEntriesYashoda' : 'gateEntriesAIPL', id, data);");

code = code.replace(/const deleteGateEntry = async \(id: string\) => firestoreDelete\('gateEntriesYashoda', 'gateEntriesAIPL', id\);/,
  "const deleteGateEntry = async (id: string, type: 'Yashoda' | 'AIPL') => firestoreDelete(type === 'Yashoda' ? 'gateEntriesYashoda' : 'gateEntriesAIPL', id);");

// Fix deleteApp
code = code.replace(/import { initializeApp, FirebaseApp } from 'firebase\/app';/, "import { initializeApp, FirebaseApp, deleteApp } from 'firebase/app';");
code = code.replace(/await secondaryApp\.delete\(\);/, "await deleteApp(secondaryApp);");


fs.writeFileSync('src/context/AppContext.tsx', code);

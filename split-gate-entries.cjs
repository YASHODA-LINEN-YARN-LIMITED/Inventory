const fs = require('fs');
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

// replace gateEntries with gateEntriesYashoda and gateEntriesAIPL
code = code.replace(/'gateEntries'/g, "'gateEntriesYashoda', 'gateEntriesAIPL'");
code = code.replace(/gateEntries: GateEntry\[\];/g, "gateEntriesYashoda: GateEntry[];\n  gateEntriesAIPL: GateEntry[];");
code = code.replace(/gateEntries: \[\],/g, "gateEntriesYashoda: [], gateEntriesAIPL: [],");

// We need to modify addGateEntry etc.
code = code.replace(/const addGateEntry = async \(entry: Omit<GateEntry, 'id'>\) => firestoreAdd\('gateEntries', entry\);/, 
  "const addGateEntry = async (entry: Omit<GateEntry, 'id'>, type: 'Yashoda' | 'AIPL') => firestoreAdd(type === 'Yashoda' ? 'gateEntriesYashoda' : 'gateEntriesAIPL', entry);");

code = code.replace(/const updateGateEntry = async \(id: string, data: Partial<GateEntry>\) => firestoreUpdate\('gateEntries', id, data\);/,
  "const updateGateEntry = async (id: string, data: Partial<GateEntry>, type: 'Yashoda' | 'AIPL') => firestoreUpdate(type === 'Yashoda' ? 'gateEntriesYashoda' : 'gateEntriesAIPL', id, data);");

code = code.replace(/const deleteGateEntry = async \(id: string\) => firestoreDelete\('gateEntries', id\);/,
  "const deleteGateEntry = async (id: string, type: 'Yashoda' | 'AIPL') => firestoreDelete(type === 'Yashoda' ? 'gateEntriesYashoda' : 'gateEntriesAIPL', id);");

code = code.replace(/const clearAllGateEntries = async \(\) => {[\s\S]*?};/, 
`const clearAllGateEntries = async (type: 'Yashoda' | 'AIPL') => {
    const coll = type === 'Yashoda' ? 'gateEntriesYashoda' : 'gateEntriesAIPL';
    const querySnapshot = await getDocs(collection(db, coll));
    const batch = writeBatch(db);
    querySnapshot.forEach((docSnap) => {
      batch.delete(doc(db, coll, docSnap.id));
    });
    await batch.commit();
  };`);

// Update interface
code = code.replace(/addGateEntry: \(entry: Omit<GateEntry, 'id'>\) => Promise<void>;/, "addGateEntry: (entry: Omit<GateEntry, 'id'>, type: 'Yashoda' | 'AIPL') => Promise<void>;");
code = code.replace(/updateGateEntry: \(id: string, data: Partial<GateEntry>\) => Promise<void>;/, "updateGateEntry: (id: string, data: Partial<GateEntry>, type: 'Yashoda' | 'AIPL') => Promise<void>;");
code = code.replace(/deleteGateEntry: \(id: string\) => Promise<void>;/, "deleteGateEntry: (id: string, type: 'Yashoda' | 'AIPL') => Promise<void>;");
code = code.replace(/clearAllGateEntries: \(\) => Promise<void>;/, "clearAllGateEntries: (type: 'Yashoda' | 'AIPL') => Promise<void>;");

fs.writeFileSync('src/context/AppContext.tsx', code);

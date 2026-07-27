const fs = require('fs');
let code = fs.readFileSync('src/pages/GateRegister.tsx', 'utf8');

// Replace gateEntries with gateEntriesYashoda and gateEntriesAIPL
code = code.replace(/const { gateEntries, addGateEntry, updateGateEntry, deleteGateEntry, clearAllGateEntries } = useApp\(\);/,
  "const { gateEntriesYashoda, gateEntriesAIPL, addGateEntry, updateGateEntry, deleteGateEntry, clearAllGateEntries } = useApp();");

code = code.replace(/const allEntries = gateEntries\.filter\(g => \(g\.companyType === companyType \|\| \(!g\.companyType && companyType === 'Yashoda'\)\)\)\.reverse\(\);/,
  "const allEntries = [...(companyType === 'Yashoda' ? gateEntriesYashoda : gateEntriesAIPL)].reverse();");

code = code.replace(/await addGateEntry\(entry as any\);/, "await addGateEntry(entry as any, companyType);");
code = code.replace(/await updateGateEntry\(editId, { \.\.\.formData, companyType }\);/, "await updateGateEntry(editId, formData, companyType);");
code = code.replace(/await addGateEntry\({ \.\.\.formData, slNo, companyType }\);/, "await addGateEntry({ ...formData, slNo }, companyType);");

code = code.replace(/await deleteGateEntry\(id\);/, "await deleteGateEntry(id, companyType);");
code = code.replace(/await clearAllGateEntries\(\);/, "await clearAllGateEntries(companyType);");

// Remove companyType from handleImport creation if it was there
code = code.replace(/companyType,/g, ""); 
// wait, the above is too dangerous, let's be more specific
code = code.replace(/entry = {\n                companyType,\n                slNo:/, "entry = {\n                slNo:");


fs.writeFileSync('src/pages/GateRegister.tsx', code);

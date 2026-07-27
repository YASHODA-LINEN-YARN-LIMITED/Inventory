const fs = require('fs');
let code = fs.readFileSync('src/pages/Reports.tsx', 'utf8');

code = code.replace(/const \{ gateEntries \} = useApp\(\);/, "const { gateEntriesYashoda, gateEntriesAIPL } = useApp();");
code = code.replace(/const allGateEntries = useMemo\(\(\) => gateEntries, \[gateEntries\]\);/, "const allGateEntries = useMemo(() => [...gateEntriesYashoda, ...gateEntriesAIPL], [gateEntriesYashoda, gateEntriesAIPL]);");

fs.writeFileSync('src/pages/Reports.tsx', code);

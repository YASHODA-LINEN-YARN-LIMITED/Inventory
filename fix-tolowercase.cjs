const fs = require('fs');
let code = fs.readFileSync('src/pages/GateRegister.tsx', 'utf8');

code = code.replace(/entry\.partyName\.toLowerCase\(\)/g, "(entry.partyName || '').toLowerCase()");
code = code.replace(/entry\.materialDescription\.toLowerCase\(\)/g, "(entry.materialDescription || '').toLowerCase()");
code = code.replace(/entry\.vehicleNo\.toLowerCase\(\)/g, "(entry.vehicleNo || '').toLowerCase()");

fs.writeFileSync('src/pages/GateRegister.tsx', code);

const fs = require('fs');
let code = fs.readFileSync('src/pages/GateRegister.tsx', 'utf8');
code = code.replace(/companyType: row\.companyType \|\| \s*slNo: row\.slNo/g, "slNo: row.slNo");
fs.writeFileSync('src/pages/GateRegister.tsx', code);

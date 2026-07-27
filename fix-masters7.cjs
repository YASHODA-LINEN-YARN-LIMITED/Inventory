const fs = require('fs');
let code = fs.readFileSync('src/pages/Masters.tsx', 'utf8');

code = code.replace(/activeTab === 'companies' \? 'Company' :/, "activeTab === 'companies' ? 'User' :");

fs.writeFileSync('src/pages/Masters.tsx', code);

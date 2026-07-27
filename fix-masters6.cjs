const fs = require('fs');
let code = fs.readFileSync('src/pages/Masters.tsx', 'utf8');

code = code.replace(/else if \(activeTab === 'companies'\) setModalType\('company'\);/, "else if (activeTab === 'companies') setModalType('user');");
code = code.replace(/onClick=\{\(\) => \{ setModalType\('company'\); setIsModalOpen\(true\); \}\}/, "onClick={() => { setModalType('user'); setIsModalOpen(true); }}");

fs.writeFileSync('src/pages/Masters.tsx', code);

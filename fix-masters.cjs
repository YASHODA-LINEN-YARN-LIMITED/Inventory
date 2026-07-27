const fs = require('fs');
let code = fs.readFileSync('src/pages/Masters.tsx', 'utf8');

code = code.replace(/<button\s*onClick=\{\(\) => setActiveTab\('users'\)\}[\s\S]*?<\/button>/g, "");
code = code.replace(/\{activeTab === 'users' && \([\s\S]*?\}\)/, "");
code = code.replace(/Companies & Plants/g, "Users");
code = code.replace(/<Factory className="w-4 h-4" \/>/g, '<Users className="w-4 h-4" />');
code = code.replace(/Add Company\/Plant/g, "Add User");

fs.writeFileSync('src/pages/Masters.tsx', code);

const fs = require('fs');
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');
code = code.replace(/await deleteApp\(secondaryApp\);/, "const { deleteApp } = await import('firebase/app'); await deleteApp(secondaryApp);");
code = code.replace(/await secondaryApp\.delete\(\);/, "const { deleteApp } = await import('firebase/app'); await deleteApp(secondaryApp);");
fs.writeFileSync('src/context/AppContext.tsx', code);

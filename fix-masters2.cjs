const fs = require('fs');
let code = fs.readFileSync('src/pages/Masters.tsx', 'utf8');

code = code.replace(/\)\}\s*\{\s*const \[formData, setFormData\]/g, ")}\n      </div>\n    </div>\n  );\n}\n\nfunction MasterModal({ type, onClose, onSave, initialData }: { type: string, onClose: () => void, onSave: (data: any) => void, initialData?: any }) {\n  const [formData, setFormData]");

fs.writeFileSync('src/pages/Masters.tsx', code);

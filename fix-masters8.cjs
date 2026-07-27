const fs = require('fs');
let code = fs.readFileSync('src/pages/Masters.tsx', 'utf8');

code = code.replace(/<th className="p-4">Status<\/th>/, '<th className="p-4">Status</th>\n                <th className="p-4">Actions</th>');

code = code.replace(/\{u.status\}\n                    <\/span>\n                  <\/td>\n                <\/tr>/g, `{u.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <button onClick={() => { setEditItem(u); setModalType('user'); setIsModalOpen(true); }} className="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                  </td>
                </tr>`);

fs.writeFileSync('src/pages/Masters.tsx', code);

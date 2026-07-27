const fs = require('fs');
let code = fs.readFileSync('src/pages/Masters.tsx', 'utf8');

const itemsTab = `
      {activeTab === 'items' && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-zinc-800/50 border-b border-gray-200 dark:border-zinc-800 text-sm text-gray-500">
              <tr>
                <th className="p-4">SKU</th>
                <th className="p-4">Name</th>
                <th className="p-4">UOM</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} className="border-b border-gray-100 dark:border-zinc-800 last:border-0">
                  <td className="p-4">{item.sku}</td>
                  <td className="p-4 font-medium">{item.name}</td>
                  <td className="p-4">{item.uom}</td>
                  <td className="p-4">
                    <button onClick={() => {}} className="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
`;

code = code.replace(/<\/table>\n\s*<\/div>\n\s*\)\}\n\s*<\/div>\n\s*<\/div>\n\s*\);\n\}/, 
"          </table>\n        </div>\n      )}\n" + itemsTab + "\n      </div>\n    </div>\n  );\n}");

fs.writeFileSync('src/pages/Masters.tsx', code);

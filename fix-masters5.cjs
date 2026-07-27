const fs = require('fs');
let code = fs.readFileSync('src/pages/Masters.tsx', 'utf8');

const modalRender = `
      {isModalOpen && (
        <MasterModal 
          type={modalType}
          initialData={editItem}
          onClose={() => { setIsModalOpen(false); setEditItem(null); }}
          onSave={async (data) => {
            if (modalType === 'warehouse') {
              if (editItem) await updateWarehouse(editItem.id, data);
              else await addWarehouse(data);
            }
            else if (modalType === 'department') {
              if (editItem) await updateDepartment(editItem.id, data);
              else await addDepartment(data);
            }
            else if (modalType === 'company') {
              // noop
            }
            else if (modalType === 'item') {
               await addItem(data);
            }
            else if (modalType === 'user') {
              if (editItem) await updateUser(editItem.id, data);
              else await addUser(data);
            }
            setIsModalOpen(false);
            setEditItem(null);
          }}
        />
      )}
`;

// Replace from line 250 to 254
code = code.replace(/\n\s*<\/div>\n\s*<\/div>\n\s*\);\n\}/, "\n" + modalRender + "    </div>\n  );\n}");

fs.writeFileSync('src/pages/Masters.tsx', code);

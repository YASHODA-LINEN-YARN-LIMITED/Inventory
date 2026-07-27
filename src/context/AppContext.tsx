import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { db, auth, signInWithGoogle, logout, signInWithEmailAndPassword, createUserWithEmailAndPassword } from '../lib/firebase';
import { collection, doc, setDoc, updateDoc, deleteDoc, onSnapshot, getDocs, writeBatch } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  console.error('Firestore Error: ', error, operationType, path);
}
import { AppState, Item, Department, Warehouse, Stock, MaterialIssue, Supplier, MaterialIssueItem, GateEntry, PurchaseRequisition, PurchaseOrder, GRN, StockTransfer, StockAdjustment } from '../types';

import { User } from 'firebase/auth';

interface AppContextType extends AppState {
  login: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
    initApp: () => Promise<void>;
  addUser: (user: any) => Promise<void>;
  updateUser: (id: string, data: any) => Promise<void>;
  addItem: (item: Omit<Item, 'id'>) => Promise<void>;
  addDepartment: (dept: Omit<Department, 'id'>) => Promise<void>;
  updateDepartment: (id: string, data: Partial<Department>) => Promise<void>;
  deleteDepartment: (id: string) => Promise<void>;
  addWarehouse: (wh: Omit<Warehouse, 'id'>) => Promise<void>;
  updateWarehouse: (id: string, data: Partial<Warehouse>) => Promise<void>;
  deleteWarehouse: (id: string) => Promise<void>;
  addSupplier: (sup: Omit<Supplier, 'id'>) => Promise<void>;
    addGateEntry: (entry: Omit<GateEntry, 'id'>, type: 'Yashoda' | 'AIPL') => Promise<void>;
  updateGateEntry: (id: string, data: Partial<GateEntry>, type: 'Yashoda' | 'AIPL') => Promise<void>;
  deleteGateEntry: (id: string, type: 'Yashoda' | 'AIPL') => Promise<void>;
  clearAllGateEntries: (type: 'Yashoda' | 'AIPL') => Promise<void>;
  addPR: (pr: Omit<PurchaseRequisition, 'id'>) => Promise<void>;
  addPO: (po: Omit<PurchaseOrder, 'id'>) => Promise<void>;
  addGRN: (grn: Omit<GRN, 'id'>) => Promise<void>;
  addStockTransfer: (transfer: Omit<StockTransfer, 'id'>) => Promise<void>;
  addStockAdjustment: (adjustment: Omit<StockAdjustment, 'id'>) => Promise<void>;
  issueMaterial: (issue: Omit<MaterialIssue, 'id'>, items: Omit<MaterialIssueItem, 'id' | 'issueId'>[]) => Promise<void>;
  updateMaterialIssue: (issueId: string, issue: Partial<MaterialIssue>, items: Omit<MaterialIssueItem, 'id' | 'issueId'>[]) => Promise<void>;
  deleteMaterialIssue: (issueId: string) => Promise<void>;
  receiveStock: (itemId: string, warehouseId: string, quantity: number, batchNo?: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'yashoda_inventory_data';

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AppState>({
    users: [], departments: [],
    suppliers: [],
    items: [],
    warehouses: [],
    stock: [],
    materialIssues: [],
    materialIssueItems: [],
    gateEntriesYashoda: [], gateEntriesAIPL: [],
    prs: [],
    pos: [],
    grns: [],
    stockTransfers: [],
    stockAdjustments: [],
    isSyncing: true,
    user: null
  });

  const [initialized, setInitialized] = useState(false);

  

  
  
  
  const initApp = async () => {
    const storedUser = localStorage.getItem('yashodaUser');
    if (storedUser) {
      setState(s => ({ ...s, user: JSON.parse(storedUser), isSyncing: false }));
      setupListeners();
    } else {
      setState(s => ({ ...s, isSyncing: false }));
    }
  };

  const setupListeners = () => {
    const collections = [
      'users',
      'departments', 'suppliers', 'items', 'warehouses', 'stock',
      'materialIssues', 'materialIssueItems', 'prs',
      'pos', 'grns', 'stockTransfers', 'stockAdjustments'
    ];
    
    collections.forEach(coll => {
      onSnapshot(collection(db, coll), (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setState(s => ({ ...s, [coll]: data as any }));
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, coll);
      });
    });

    // Listen to GateEntries_Yashoda collection (and legacy gateEntriesYashoda)
    onSnapshot(collection(db, 'GateEntries_Yashoda'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setState(s => ({ ...s, gateEntriesYashoda: data as any }));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'GateEntries_Yashoda');
    });

    // Listen to GateEntries_AIPL collection
    onSnapshot(collection(db, 'GateEntries_AIPL'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setState(s => ({ ...s, gateEntriesAIPL: data as any }));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'GateEntries_AIPL');
    });
  };

  
  const login = async () => {
    try {
      await signInWithGoogle();
    } catch(e) {
      console.error(e);
    }
  }

  const loginWithEmail = async (email: string, pass: string) => {
    const mockUser = { displayName: email.split('@')[0], email, uid: 'mock-' + Date.now() };
    localStorage.setItem('yashodaUser', JSON.stringify(mockUser));
    setState(s => ({ ...s, user: mockUser as any }));
    setupListeners();
  }


  const logoutUser = async () => {
    localStorage.removeItem('yashodaUser');
    setState(s => ({
      ...s,
      user: null,
      users: [], departments: [], suppliers: [], items: [], warehouses: [], stock: [],
      materialIssues: [], materialIssueItems: [], gateEntriesYashoda: [], gateEntriesAIPL: [], prs: [],
      pos: [], grns: [], stockTransfers: [], stockAdjustments: []
    }));
  }


  
  const firestoreAdd = async (coll: string, data: any) => {
    const newId = Date.now().toString() + Math.random().toString(36).substring(7);
    const itemData = { ...data, id: newId };
    try {
      await setDoc(doc(db, coll, newId), itemData);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, coll);
    }
  };

  const firestoreUpdate = async (coll: string, id: string, data: any) => {
    try {
      await updateDoc(doc(db, coll, id), data);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, coll);
    }
  };

  const firestoreDelete = async (coll: string, id: string) => {
    try {
      await deleteDoc(doc(db, coll, id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, coll);
    }
  };

  const addUser = async (userData: any) => {
    if (userData.password) {
      // create user in Firebase Auth using a secondary app instance to avoid auto-login disrupting admin
      const { initializeApp } = await import('firebase/app');
      const { getAuth, createUserWithEmailAndPassword } = await import('firebase/auth');
      const { firebaseConfig } = await import('../lib/firebase');
      
      const secondaryApp = initializeApp(firebaseConfig, 'Secondary' + Date.now());
      const secondaryAuth = getAuth(secondaryApp);
      try {
        await createUserWithEmailAndPassword(secondaryAuth, userData.email, userData.password);
      } catch (e: any) {
        console.error("Auth creation failed", e);
        throw new Error(e.message || "Failed to create authentication user");
      } finally {
        const { deleteApp } = await import('firebase/app'); await deleteApp(secondaryApp);
      }
    }
    const { password, ...rest } = userData;
    return firestoreAdd('users', rest);
  };
  const updateUser = async (id: string, data: any) => firestoreUpdate('users', id, data);
  const addItem = async (item: Omit<Item, 'id'>) => firestoreAdd('items', item);
  const updateItem = async (id: string, data: Partial<Item>) => firestoreUpdate('items', id, data);
  const deleteItem = async (id: string) => firestoreDelete('items', id);
  const addDepartment = async (dept: Omit<Department, 'id'>) => firestoreAdd('departments', dept);
  const updateDepartment = async (id: string, data: Partial<Department>) => firestoreUpdate('departments', id, data);
  const deleteDepartment = async (id: string) => firestoreDelete('departments', id);
  const addWarehouse = async (wh: Omit<Warehouse, 'id'>) => firestoreAdd('warehouses', wh);
  const updateWarehouse = async (id: string, data: Partial<Warehouse>) => firestoreUpdate('warehouses', id, data);
  const deleteWarehouse = async (id: string) => firestoreDelete('warehouses', id);
  const addSupplier = async (sup: Omit<Supplier, 'id'>) => firestoreAdd('suppliers', sup);
    const addGateEntry = async (entry: Omit<GateEntry, 'id'>, type: 'Yashoda' | 'AIPL') => firestoreAdd(type === 'Yashoda' ? 'GateEntries_Yashoda' : 'GateEntries_AIPL', entry);
  const updateGateEntry = async (id: string, data: Partial<GateEntry>, type: 'Yashoda' | 'AIPL') => firestoreUpdate(type === 'Yashoda' ? 'GateEntries_Yashoda' : 'GateEntries_AIPL', id, data);
  const deleteGateEntry = async (id: string, type: 'Yashoda' | 'AIPL') => firestoreDelete(type === 'Yashoda' ? 'GateEntries_Yashoda' : 'GateEntries_AIPL', id);
  const clearAllGateEntries = async (type: 'Yashoda' | 'AIPL') => {
    const coll = type === 'Yashoda' ? 'GateEntries_Yashoda' : 'GateEntries_AIPL';
    const querySnapshot = await getDocs(collection(db, coll));
    const batch = writeBatch(db);
    querySnapshot.forEach((docSnap) => {
      batch.delete(doc(db, coll, docSnap.id));
    });
    await batch.commit();
  };
  const addPR = async (pr: Omit<PurchaseRequisition, 'id'>) => firestoreAdd('prs', pr);
  const addPO = async (po: Omit<PurchaseOrder, 'id'>) => firestoreAdd('pos', po);
  const addGRN = async (grn: Omit<GRN, 'id'>) => firestoreAdd('grns', grn);
  const addStockTransfer = async (transfer: Omit<StockTransfer, 'id'>) => firestoreAdd('stockTransfers', transfer);
  const addStockAdjustment = async (adjustment: Omit<StockAdjustment, 'id'>) => firestoreAdd('stockAdjustments', adjustment);

  const issueMaterial = async (issue: Omit<MaterialIssue, 'id'>, itemsData: Omit<MaterialIssueItem, 'id' | 'issueId'>[]) => {
    try {
      const batch = writeBatch(db);
      
      const newIssueId = Date.now().toString();
      const issueRef = doc(db, 'materialIssues', newIssueId);
      batch.set(issueRef, { ...issue, id: newIssueId });

      for (const item of itemsData) {
        const newItemId = Date.now().toString() + Math.random();
        const itemRef = doc(db, 'materialIssueItems', newItemId);
        batch.set(itemRef, { ...item, id: newItemId, issueId: newIssueId });
        
        const stockSnapshot = await getDocs(collection(db, 'stock'));
        const existingStock = stockSnapshot.docs.map(d => ({id: d.id, ...(d.data() as Omit<Stock, 'id'>)}))
          .find((st: any) => st.itemId === item.itemId);
        
        if (existingStock) {
           const stockRef = doc(db, 'stock', existingStock.id);
           batch.update(stockRef, { quantity: (existingStock.quantity as number) - item.quantity });
        } else {
           const newStockId = Date.now().toString() + Math.random();
           const stockRef = doc(db, 'stock', newStockId);
           batch.set(stockRef, { itemId: item.itemId, warehouseId: 'default', quantity: -item.quantity });
        }
      }
      
      await batch.commit();
    } catch(e) {
      handleFirestoreError(e, OperationType.WRITE, 'materialIssues');
    }
  };

  const updateMaterialIssue = async (
    issueId: string,
    issueData: Partial<MaterialIssue>,
    itemsData: Omit<MaterialIssueItem, 'id' | 'issueId'>[]
  ) => {
    try {
      const batch = writeBatch(db);
      const issueRef = doc(db, 'materialIssues', issueId);
      batch.update(issueRef, issueData);

      const itemsSnapshot = await getDocs(collection(db, 'materialIssueItems'));
      const oldIssueItems = itemsSnapshot.docs
        .map(d => ({ id: d.id, ...(d.data() as MaterialIssueItem) }))
        .filter(item => item.issueId === issueId);

      const stockSnapshot = await getDocs(collection(db, 'stock'));
      const allStock = stockSnapshot.docs.map(d => ({ id: d.id, ...(d.data() as Stock) }));

      // 1. Revert stock for old items and delete old issue item docs
      for (const oldItem of oldIssueItems) {
        const itemRef = doc(db, 'materialIssueItems', oldItem.id);
        batch.delete(itemRef);

        const existingStock = allStock.find(st => st.itemId === oldItem.itemId);
        if (existingStock) {
          existingStock.quantity = (existingStock.quantity as number) + Number(oldItem.quantity || 0);
          const stockRef = doc(db, 'stock', existingStock.id);
          batch.update(stockRef, { quantity: existingStock.quantity });
        }
      }

      // 2. Deduct stock for new items and write new issue item docs
      for (const newItem of itemsData) {
        const newItemId = Date.now().toString() + Math.random().toString(36).substring(7);
        const itemRef = doc(db, 'materialIssueItems', newItemId);
        batch.set(itemRef, { ...newItem, id: newItemId, issueId });

        const existingStock = allStock.find(st => st.itemId === newItem.itemId);
        if (existingStock) {
          existingStock.quantity = (existingStock.quantity as number) - Number(newItem.quantity || 0);
          const stockRef = doc(db, 'stock', existingStock.id);
          batch.update(stockRef, { quantity: existingStock.quantity });
        } else {
          const newStockId = Date.now().toString() + Math.random().toString(36).substring(7);
          const stockRef = doc(db, 'stock', newStockId);
          batch.set(stockRef, { itemId: newItem.itemId, warehouseId: 'default', quantity: -Number(newItem.quantity || 0) });
        }
      }

      await batch.commit();
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, 'materialIssues');
    }
  };

  const deleteMaterialIssue = async (issueId: string) => {
    try {
      const batch = writeBatch(db);
      const issueRef = doc(db, 'materialIssues', issueId);
      batch.delete(issueRef);

      const itemsSnapshot = await getDocs(collection(db, 'materialIssueItems'));
      const issueItems = itemsSnapshot.docs
        .map(d => ({ id: d.id, ...(d.data() as MaterialIssueItem) }))
        .filter(item => item.issueId === issueId);

      const stockSnapshot = await getDocs(collection(db, 'stock'));
      const allStock = stockSnapshot.docs.map(d => ({ id: d.id, ...(d.data() as Stock) }));

      for (const item of issueItems) {
        const itemRef = doc(db, 'materialIssueItems', item.id);
        batch.delete(itemRef);

        const existingStock = allStock.find(st => st.itemId === item.itemId);
        if (existingStock) {
          const stockRef = doc(db, 'stock', existingStock.id);
          batch.update(stockRef, { quantity: (existingStock.quantity as number) + Number(item.quantity || 0) });
        }
      }

      await batch.commit();
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, 'materialIssues');
    }
  };

  const receiveStock = async (itemId: string, warehouseId: string, quantity: number, batchNo?: string) => {
    try {
      const stockSnapshot = await getDocs(collection(db, 'stock'));
      const existingStock = stockSnapshot.docs.map(d => ({id: d.id, ...(d.data() as Omit<Stock, 'id'>)}))
        .find((st: any) => st.itemId === itemId && st.warehouseId === warehouseId && st.batchNo === batchNo);
        
      if (existingStock) {
        await updateDoc(doc(db, 'stock', existingStock.id), { quantity: (existingStock.quantity as number) + quantity });
      } else {
        const newStockId = Date.now().toString() + Math.random();
        await setDoc(doc(db, 'stock', newStockId), { itemId, warehouseId, quantity, batchNo, lastUpdated: new Date().toISOString() });
      }
    } catch(e) {
      handleFirestoreError(e, OperationType.WRITE, 'stock');
    }
  };


  const value = { login, loginWithEmail, addUser, updateUser, logout: logoutUser,
    ...state,
    users: state.users || [],
    departments: state.departments || [],
    suppliers: state.suppliers || [],
    items: state.items || [],
    warehouses: state.warehouses || [],
    stock: state.stock || [],
    materialIssues: state.materialIssues || [],
    materialIssueItems: state.materialIssueItems || [],
    gateEntriesYashoda: state.gateEntriesYashoda || [],
    gateEntriesAIPL: state.gateEntriesAIPL || [],
    prs: state.prs || [],
    pos: state.pos || [],
    grns: state.grns || [],
    stockTransfers: state.stockTransfers || [],
    stockAdjustments: state.stockAdjustments || [],
    
    initApp,
    addItem,
    updateItem,
    deleteItem,
    addDepartment,
    updateDepartment,
    deleteDepartment,
    addWarehouse,
    updateWarehouse,
    deleteWarehouse,
    addSupplier,
        addGateEntry,
    updateGateEntry,
    deleteGateEntry,
    clearAllGateEntries,
    addPR,
    addPO,
    addGRN,
    addStockTransfer,
    addStockAdjustment,
    issueMaterial,
    updateMaterialIssue,
    deleteMaterialIssue,
    receiveStock,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

import { db } from '../firebase'
import {
  collection,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore'

// ==================== TABLES ====================

export async function getTable(tableNumber) {
  const docRef = doc(db, 'tables', String(tableNumber))
  const snap = await getDoc(docRef)
  return snap.exists() ? snap.data() : null
}

export async function setTable(tableNumber, data) {
  const docRef = doc(db, 'tables', String(tableNumber))
  await setDoc(docRef, data)
}

export async function deleteTable(tableNumber) {
  const docRef = doc(db, 'tables', String(tableNumber))
  await deleteDoc(docRef)
}

export function subscribeToTable(tableNumber, callback) {
  const docRef = doc(db, 'tables', String(tableNumber))
  return onSnapshot(docRef, (snap) => {
    callback(snap.exists() ? snap.data() : null)
  })
}

// ==================== ORDERS ====================

export async function createOrder(orderId, data) {
  const docRef = doc(db, 'orders', orderId)
  await setDoc(docRef, data)
}

export async function updateOrder(orderId, data) {
  const docRef = doc(db, 'orders', orderId)
  await setDoc(docRef, data, { merge: true })
}

export function subscribeToOrders(callback) {
  const q = query(collection(db, 'orders'), orderBy('timestamp', 'desc'))
  return onSnapshot(q, (snapshot) => {
    const orders = snapshot.docs.map(d => ({ ...d.data(), id: d.id }))
    callback(orders)
  })
}

// ==================== NOTIFICATIONS ====================

export async function createNotification(notifId, data) {
  const docRef = doc(db, 'notifications', notifId)
  await setDoc(docRef, data)
}

export async function updateNotification(notifId, data) {
  const docRef = doc(db, 'notifications', notifId)
  await setDoc(docRef, data, { merge: true })
}

export function subscribeToNotifications(callback) {
  const q = query(collection(db, 'notifications'), orderBy('timestamp', 'desc'))
  return onSnapshot(q, (snapshot) => {
    const notifications = snapshot.docs.map(d => ({ ...d.data(), id: d.id }))
    callback(notifications)
  })
}

// ==================== TABLES LIST (for admin) ====================

export function subscribeToTables(callback) {
  return onSnapshot(collection(db, 'tables'), (snapshot) => {
    const tables = snapshot.docs.map(d => ({ ...d.data(), id: d.id }))
    callback(tables)
  })
}

// ==================== LOCAL STORAGE (notification cooldowns) ====================

export function getLocal(key) {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

export function setLocal(key, value) {
  try {
    localStorage.setItem(key, String(value))
  } catch {
    // silently fail
  }
}

// ==================== MENU ====================

export async function getMenuItems() {
  const snapshot = await getDocs(collection(db, 'menu'))
  return snapshot.docs.map(d => ({ ...d.data(), id: d.id }))
}

export async function setMenuItem(id, data) {
  const docRef = doc(db, 'menu', id)
  await setDoc(docRef, data, { merge: true })
}

export function subscribeToMenu(callback) {
  return onSnapshot(collection(db, 'menu'), (snapshot) => {
    const items = snapshot.docs.map(d => ({ ...d.data(), id: d.id }))
    callback(items)
  })
}

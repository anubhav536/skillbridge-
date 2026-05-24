// Local persistent database layer (Firebase Firestore-compatible subset)
const STORAGE_KEY = "skillbridge_local_db_v1";
const listeners = new Set();

const createInitial = () => ({
  users: {}, jobs: {}, applications: {}, contacts: {}, notifications: {}, logs: {}, leaderboard: {}, flags: {}, aiConfig: {}, settings: {}, moderation: {}, presence: {}
});

function readStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : createInitial();
  } catch {
    return createInitial();
  }
}
function writeStore(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  listeners.forEach((fn) => fn());
}
function uid() { return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}_${Math.random().toString(36).slice(2)}`; }

export const db = { type: "localdb" };

export function collection(_db, name) { return { kind: "collection", name }; }
export function doc(_db, colName, id) { return { kind: "doc", colName, id }; }
export function where(field, op, value) { return { type: "where", field, op, value }; }
export function orderBy(field, direction = "asc") { return { type: "orderBy", field, direction }; }
export function limit(count) { return { type: "limit", count }; }
export function query(base, ...constraints) { return { kind: "query", base, constraints }; }
export function serverTimestamp() { return new Date().toISOString(); }

function makeDocSnap(id, data) {
  return { id, exists: () => Boolean(data), data: () => data || null };
}
function makeQuerySnap(items) {
  const docs = items.map(({ id, data }) => ({ id, data: () => data }));
  return { docs, size: docs.length, forEach: (cb) => docs.forEach(cb) };
}
function applyConstraints(items, constraints = []) {
  let out = [...items];
  for (const c of constraints) {
    if (c.type === "where") {
      out = out.filter(({ data }) => {
        const left = data?.[c.field];
        if (c.op === "==") return left === c.value;
        if (c.op === "!=") return left !== c.value;
        if (c.op === ">") return left > c.value;
        if (c.op === ">=") return left >= c.value;
        if (c.op === "<") return left < c.value;
        if (c.op === "<=") return left <= c.value;
        return false;
      });
    }
    if (c.type === "orderBy") {
      const dir = c.direction === "desc" ? -1 : 1;
      out.sort((a, b) => (a.data?.[c.field] > b.data?.[c.field] ? dir : -dir));
    }
    if (c.type === "limit") out = out.slice(0, c.count);
  }
  return out;
}

export async function addDoc(colRef, data) {
  const store = readStore();
  store[colRef.name] ||= {};
  const id = uid();
  store[colRef.name][id] = { ...data, id };
  writeStore(store);
  return { id };
}
export async function getDocs(ref) {
  const store = readStore();
  const baseCol = ref.kind === "query" ? ref.base.name : ref.name;
  const table = store[baseCol] || {};
  const rows = Object.entries(table).map(([id, data]) => ({ id, data }));
  const result = ref.kind === "query" ? applyConstraints(rows, ref.constraints) : rows;
  return makeQuerySnap(result);
}
export async function getDoc(docRef) {
  const store = readStore();
  return makeDocSnap(docRef.id, store[docRef.colName]?.[docRef.id]);
}
export async function setDoc(docRef, data, opts = {}) {
  const store = readStore();
  store[docRef.colName] ||= {};
  const prev = store[docRef.colName][docRef.id] || {};
  store[docRef.colName][docRef.id] = opts.merge ? { ...prev, ...data } : { ...data };
  writeStore(store);
}
export async function updateDoc(docRef, data) {
  return setDoc(docRef, data, { merge: true });
}
export async function deleteDoc(docRef) {
  const store = readStore();
  if (store[docRef.colName]) delete store[docRef.colName][docRef.id];
  writeStore(store);
}
export function onSnapshot(ref, cb) {
  let active = true;
  const run = async () => {
    if (!active) return;
    if (ref.kind === "doc") cb(await getDoc(ref));
    else cb(await getDocs(ref));
  };
  const listener = () => run();
  listeners.add(listener);
  run();
  const timer = setInterval(run, 2000);
  return () => {
    active = false;
    clearInterval(timer);
    listeners.delete(listener);
  };
}

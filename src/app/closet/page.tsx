"use client";
import { useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { auth, db, storage } from "../../firebaseConfig";
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, onSnapshot } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { onAuthStateChanged } from "firebase/auth";
import Image from "next/image";

type WardrobeItem = {
  id: string;
  userId: string;
  name: string;
  category: string;
  imageUrl: string;
  createdAt?: string;
};

type WardrobeByCategory = {
  [category: string]: WardrobeItem[];
};

type NewItem = {
  name: string;
  category: string;
  image: File | null;
};

const CATEGORIES = [
  "dresses", "shirts", "sweaters", "jackets", "pants", "shoes", "accessories"
];

export default function ClosetPage() {
  if (typeof window === "undefined") {
    // Prevent hydration mismatch by not rendering on the server
    return null;
  }
  const [user, setUser] = useState<User | null>(null);
  const [wardrobe, setWardrobe] = useState<WardrobeByCategory>({});
  const [avatarUrl, setAvatarUrl] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [newItem, setNewItem] = useState<NewItem>({ name: "", category: CATEGORIES[0], image: null });
  const [selectedClothing, setSelectedClothing] = useState<WardrobeItem | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);

  // Auth listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) setLoading(false);
    });
    return () => unsub();
  }, []);

  // Fetch wardrobe items
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "wardrobe"), where("userId", "==", user.uid));
    const unsub = onSnapshot(q, (snap) => {
      const items: WardrobeByCategory = {};
      snap.forEach(docSnap => {
        const data = docSnap.data() as Omit<WardrobeItem, "id">;
        if (!items[data.category]) items[data.category] = [];
        items[data.category].push({ id: docSnap.id, ...data });
      });
      setWardrobe(items);
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  // Fetch avatar
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "avatars"), where("userId", "==", user.uid));
    getDocs(q).then(snap => {
      if (!snap.empty) setAvatarUrl(snap.docs[0].data().imageUrl);
    });
  }, [user]);

  // Add wardrobe item
  async function handleAddItem(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!newItem.image || !user) return;
    const imgRef = ref(storage, `wardrobe/${user.uid}/${Date.now()}_${newItem.image.name}`);
    await uploadBytes(imgRef, newItem.image);
    const url = await getDownloadURL(imgRef);
    await addDoc(collection(db, "wardrobe"), {
      userId: user.uid,
      name: newItem.name,
      category: newItem.category,
      imageUrl: url,
      createdAt: new Date().toISOString()
    });
    setShowAddModal(false);
    setNewItem({ name: "", category: CATEGORIES[0], image: null });
  }

  // Remove wardrobe item
  async function handleRemoveItem(id: string) {
    await deleteDoc(doc(db, "wardrobe", id));
  }

  // Upload avatar
  async function handleAvatarUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!avatarFile || !user) return;
    const imgRef = ref(storage, `avatars/${user.uid}/${Date.now()}_${avatarFile.name}`);
    await uploadBytes(imgRef, avatarFile);
    const url = await getDownloadURL(imgRef);
    await addDoc(collection(db, "avatars"), {
      userId: user.uid,
      imageUrl: url,
      createdAt: new Date().toISOString()
    });
    setAvatarUrl(url);
    setShowAvatarModal(false);
    setAvatarFile(null);
  }

  if (loading) return <div className="text-center py-20">Loading...</div>;
  if (!user) return <div className="text-center py-20">Please sign in to view your closet.</div>;

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 bg-base text-color min-h-screen" style={{ background: 'var(--background-base)' }}>
      <div className="flex flex-col md:flex-row gap-8 mb-10 items-center md:items-start">
        <div className="flex flex-col items-center">
          <div className="relative w-48 h-64 mb-2">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover rounded-2xl border-4 border-secondary-accent" />
            ) : (
              <div className="w-full h-full bg-gray-200 rounded-2xl flex items-center justify-center text-muted">No Avatar</div>
            )}
            {selectedClothing && (
              <img src={selectedClothing.imageUrl} alt="Try On" className="absolute top-0 left-0 w-full h-full object-contain pointer-events-none" style={{ zIndex: 10 }} />
            )}
          </div>
          <button className="button-secondary w-auto px-6 py-2 mt-2" onClick={() => setShowAvatarModal(true)}>
            {avatarUrl ? "Change Avatar" : "Upload Avatar"}
          </button>
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-4 text-primary">My Closet</h1>
          <button className="button-primary w-auto px-6 py-2 mb-6" onClick={() => setShowAddModal(true)}>
            + Add Item
          </button>
          {CATEGORIES.map(cat => (
            <div key={cat} className="mb-8">
              <h2 className="text-xl font-semibold mb-3 text-secondary capitalize">{cat}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {(wardrobe[cat] || []).length === 0 && <div className="text-muted col-span-full">No items</div>}
                {(wardrobe[cat] || []).map(item => (
                  <div key={item.id} className="bg-card rounded-xl shadow p-3 flex flex-col items-center relative">
                    <img src={item.imageUrl} alt={item.name} className="w-28 h-32 object-cover rounded mb-2" />
                    <div className="font-medium text-primary mb-1 text-center">{item.name}</div>
                    <div className="flex gap-2">
                      <button className="button-secondary w-auto px-3 py-1 text-xs" onClick={() => setSelectedClothing(item)}>
                        Try On
                      </button>
                      <button className="button-secondary w-auto px-3 py-1 text-xs" onClick={() => handleRemoveItem(item.id)}>
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <form className="bg-white rounded-xl p-8 shadow-lg w-full max-w-md" onSubmit={handleAddItem}>
            <h2 className="text-xl font-bold mb-4 text-primary">Add New Item</h2>
            <div className="mb-3">
              <label className="block mb-1 text-sm font-medium">Name</label>
              <input type="text" className="w-full border border-gray-300 rounded px-3 py-2" value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} required />
            </div>
            <div className="mb-3">
              <label className="block mb-1 text-sm font-medium">Category</label>
              <select className="w-full border border-gray-300 rounded px-3 py-2" value={newItem.category} onChange={e => setNewItem({ ...newItem, category: e.target.value })}>
                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div className="mb-4">
              <label className="block mb-1 text-sm font-medium">Image</label>
              <input type="file" accept="image/*" onChange={e => {
                const files = e.target.files;
                setNewItem({ ...newItem, image: files && files[0] ? files[0] : null });
              }} required />
            </div>
            <div className="flex gap-4 justify-end">
              <button type="button" className="button-secondary px-4 py-2" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button type="submit" className="button-primary px-4 py-2">Add</button>
            </div>
          </form>
        </div>
      )}

      {/* Avatar Modal */}
      {showAvatarModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <form className="bg-white rounded-xl p-8 shadow-lg w-full max-w-md" onSubmit={handleAvatarUpload}>
            <h2 className="text-xl font-bold mb-4 text-primary">Upload Avatar</h2>
            <div className="mb-4">
              <input type="file" accept="image/*" onChange={e => {
                const files = e.target.files;
                setAvatarFile(files && files[0] ? files[0] : null);
              }} required />
            </div>
            <div className="flex gap-4 justify-end">
              <button type="button" className="button-secondary px-4 py-2" onClick={() => setShowAvatarModal(false)}>Cancel</button>
              <button type="submit" className="button-primary px-4 py-2">Upload</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

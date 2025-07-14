"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { auth } from "../../firebaseConfig";
import { onAuthStateChanged, User } from "firebase/auth";
import { useRouter } from "next/navigation";

interface WardrobeItem {
  id: string;
  name: string;
  imageUrl: string;
}

interface Outfit {
  id: string;
  name: string;
  items: WardrobeItem[];
  createdAt: string;
}

export default function OutfitBuilderPage() {
  const [wardrobeItems, setWardrobeItems] = useState<WardrobeItem[]>([]);
  const [currentOutfit, setCurrentOutfit] = useState<WardrobeItem[]>([]);
  const [savedOutfits, setSavedOutfits] = useState<Outfit[]>([]);
  const [outfitName, setOutfitName] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      if (!user) {
        router.push("/auth");
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Load wardrobe items and saved outfits from localStorage
  useEffect(() => {
    if (user) {
      const savedWardrobe = localStorage.getItem('wardrobe-items');
      const savedOutfitsData = localStorage.getItem('saved-outfits');
      
      if (savedWardrobe) {
        setWardrobeItems(JSON.parse(savedWardrobe));
      }
      
      if (savedOutfitsData) {
        setSavedOutfits(JSON.parse(savedOutfitsData));
      }
    }
  }, [user]);

  // Save outfits to localStorage whenever they change
  useEffect(() => {
    if (user) {
      localStorage.setItem('saved-outfits', JSON.stringify(savedOutfits));
    }
  }, [savedOutfits, user]);

  const addToOutfit = (item: WardrobeItem) => {
    setCurrentOutfit(prev => [...prev, item]);
  };

  const removeFromOutfit = (index: number) => {
    setCurrentOutfit(prev => prev.filter((_, i) => i !== index));
  };

  const saveOutfit = () => {
    if (currentOutfit.length === 0) {
      alert("Add some items to your outfit first!");
      return;
    }

    const name = outfitName.trim() || `Outfit ${savedOutfits.length + 1}`;
    const newOutfit: Outfit = {
      id: Date.now().toString(),
      name,
      items: [...currentOutfit],
      createdAt: new Date().toISOString()
    };

    setSavedOutfits(prev => [newOutfit, ...prev]);
    setCurrentOutfit([]);
    setOutfitName("");
  };

  const deleteOutfit = (outfitId: string) => {
    setSavedOutfits(prev => prev.filter(outfit => outfit.id !== outfitId));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-primary">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Outfit Builder</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Wardrobe Section */}
        <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Your Wardrobe</h2>
          <div className="grid grid-cols-3 gap-3 max-h-96 overflow-y-auto">
            {wardrobeItems.map(item => (
              <div
                key={item.id}
                className="bg-gray-50 rounded-lg p-2 cursor-pointer hover:bg-closetly-accent transition border-2 border-transparent hover:border-closetly-primary-light"
                onClick={() => addToOutfit(item)}
              >
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  width={60}
                  height={60}
                  className="w-full h-16 object-cover rounded mb-1"
                />
                <p className="text-xs text-center text-gray-600 truncate">{item.name}</p>
              </div>
            ))}
          </div>
          {wardrobeItems.length === 0 && (
            <p className="text-center text-gray-500 mt-4">
              No items in your wardrobe. Add some clothes first!
            </p>
          )}
        </div>

        {/* Outfit Builder Section */}
        <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Current Outfit</h2>
          
          {/* Outfit Name Input */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Name your outfit..."
              value={outfitName}
              onChange={(e) => setOutfitName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-closetly-primary"
            />
          </div>

          {/* Outfit Items */}
          <div className="grid grid-cols-3 gap-3 mb-4 min-h-32 bg-gray-50 rounded-lg p-4">
            {currentOutfit.map((item, index) => (
              <div key={`${item.id}-${index}`} className="relative">
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  width={80}
                  height={80}
                  className="w-full h-20 object-cover rounded border-2 border-closetly-primary-light"
                />
                <button
                  onClick={() => removeFromOutfit(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 transition"
                >
                  ×
                </button>
                <p className="text-xs text-center text-gray-600 mt-1 truncate">{item.name}</p>
              </div>
            ))}
            {currentOutfit.length === 0 && (
              <div className="col-span-3 flex items-center justify-center text-gray-500">
                <p>Click items from your wardrobe to build an outfit</p>
              </div>
            )}
          </div>

          {/* Save Button */}
          <button
            onClick={saveOutfit}
            disabled={currentOutfit.length === 0}
            className="w-full bg-closetly-primary text-white py-2 px-4 rounded-md hover:bg-closetly-primary-dark transition font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Save Outfit
          </button>
        </div>
      </div>

      {/* Saved Outfits Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Saved Outfits</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedOutfits.map(outfit => (
            <div key={outfit.id} className="bg-white rounded-xl shadow p-4 border border-gray-200">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-gray-900">{outfit.name}</h3>
                <button
                  onClick={() => deleteOutfit(outfit.id)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Delete
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {outfit.items.map((item, index) => (
                  <div key={`${item.id}-${index}`}>
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      width={60}
                      height={60}
                      className="w-full h-16 object-cover rounded"
                    />
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {new Date(outfit.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
        {savedOutfits.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <p>No saved outfits yet. Create your first outfit!</p>
          </div>
        )}
      </div>
    </div>
  );
} 
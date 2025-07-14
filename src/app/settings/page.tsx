"use client";
import { useState, useEffect } from "react";
import { auth, db } from "../../firebaseConfig";
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider, sendPasswordResetEmail } from "firebase/auth";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import { useRouter } from "next/navigation";

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  createdAt?: string;
}

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Form states
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);
  
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setLoading(false);
      if (user) {
        fetchUserProfile(user.uid);
      } else {
        router.push("/auth");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const fetchUserProfile = async (userId: string) => {
    try {
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        const profile = userDoc.data() as UserProfile;
        setUserProfile(profile);
        setFirstName(profile.firstName);
        setLastName(profile.lastName);
        setEmail(profile.email);
      } else {
        // Create user document if it doesn't exist
        const newProfile = {
          firstName: user?.displayName?.split(' ')[0] || '',
          lastName: user?.displayName?.split(' ').slice(1).join(' ') || '',
          email: user?.email || '',
          createdAt: new Date().toISOString()
        };
        await setDoc(doc(db, "users", userId), newProfile);
        setUserProfile(newProfile);
        setFirstName(newProfile.firstName);
        setLastName(newProfile.lastName);
        setEmail(newProfile.email);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setError("Failed to load profile");
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      // Use setDoc to create or update the document
      await setDoc(doc(db, "users", user.uid), {
        firstName,
        lastName,
        email: user.email || "",
        updatedAt: new Date().toISOString()
      }, { merge: true }); // merge: true will update existing fields without overwriting the entire document

      setSuccess("Profile updated successfully!");
      setUserProfile({ firstName, lastName, email: user.email || "" });
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !currentPassword || !newPassword || !confirmPassword) return;

    if (newPassword !== confirmPassword) {
      setError("New passwords don't match");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      // Re-authenticate user before password change
      const credential = EmailAuthProvider.credential(user.email!, currentPassword);
      await reauthenticateWithCredential(user, credential);
      
      // Update password
      await updatePassword(user, newPassword);
      
      setSuccess("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      console.error("Error updating password:", error);
      if (error.code === 'auth/wrong-password') {
        setError("Current password is incorrect");
      } else {
        setError("Failed to update password");
      }
    } finally {
      setSaving(false);
    }
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
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-color">Settings</h1>
        <p className="text-muted mt-2">Manage your account and preferences</p>
      </div>

      {error && (
        <div className="bg-error text-white px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-success text-color px-4 py-3 rounded mb-6">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profile Settings */}
        <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 text-color">Profile Information</h2>
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed from this interface</p>
            </div>
            
            <button
              type="submit"
              disabled={saving}
              className="button-primary px-6 py-2 rounded-lg font-semibold shadow transition disabled:opacity-50"
            >
              {saving ? "Saving..." : "Update Profile"}
            </button>
          </form>
        </div>

        {/* Password Settings */}
        <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 text-color">Change Password</h2>
          {!showForgotPassword ? (
          <form onSubmit={handlePasswordUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={saving}
              className="button-secondary px-6 py-2 rounded-lg font-semibold shadow transition disabled:opacity-50"
            >
              {saving ? "Updating..." : "Update Password"}
            </button>
            <button
              type="button"
              className="text-accent underline mt-2 block"
              onClick={() => { setShowForgotPassword(true); setError(""); setSuccess(""); }}
            >
              Forgot Password?
            </button>
          </form>
          ) : (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setError("");
                setSuccess("");
                setResetSent(false);
                try {
                  await sendPasswordResetEmail(auth, resetEmail);
                  setResetSent(true);
                } catch (err: any) {
                  setError("Failed to send reset email. Please check the address and try again.");
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Enter your email to reset password</label>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={e => setResetEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <button
                type="submit"
                className="button-primary px-6 py-2 rounded-lg font-semibold shadow transition"
              >
                Send Reset Email
              </button>
              <button
                type="button"
                className="text-accent underline mt-2 block"
                onClick={() => { setShowForgotPassword(false); setResetEmail(""); setResetSent(false); setError(""); setSuccess(""); }}
              >
                Back to Change Password
              </button>
              {resetSent && (
                <div className="text-success mt-2">A password reset email has been sent if the address exists in our system.</div>
              )}
            </form>
          )}
        </div>
      </div>

      {/* Account Info */}
      <div className="mt-8 bg-white rounded-xl shadow p-6 border border-gray-200">
        <h2 className="text-xl font-semibold mb-4 text-color">Account Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-sm font-medium text-gray-700">Account Created:</span>
            <p className="text-muted">
              {userProfile ? new Date(userProfile.createdAt || Date.now()).toLocaleDateString() : 'N/A'}
            </p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-700">User ID:</span>
            <p className="text-muted font-mono text-sm">{user.uid}</p>
          </div>
        </div>
      </div>
    </div>
  );
} 
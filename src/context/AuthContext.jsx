import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { attendanceService } from '../services/attendanceService';
import { initialProfiles } from '../services/mockData';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(!isSupabaseConfigured());

  // Helper to load saved demo profile or default
  const restoreDemoProfile = () => {
    const saved = localStorage.getItem('attend_demo_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setProfile(parsed);
        setUser({ id: parsed.id, email: parsed.email });
        return parsed;
      } catch {
        // ignore
      }
    }
    const defaultAdmin = initialProfiles[0];
    setProfile(defaultAdmin);
    setUser({ id: defaultAdmin.id, email: defaultAdmin.email });
    return defaultAdmin;
  };

  // Load profile for authenticated Supabase user
  const fetchSupabaseProfile = async (authUserId) => {
    try {
      if (!supabase) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUserId)
        .single();
      if (error) {
        console.warn('Could not fetch Supabase profile:', error.message);
        return null;
      }
      return data;
    } catch (err) {
      console.warn('Fetch profile exception:', err);
      return null;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);

      // Check if user has an active demo profile stored
      const savedDemoProfile = localStorage.getItem('attend_demo_profile');
      let demoRestored = null;
      if (savedDemoProfile) {
        try {
          demoRestored = JSON.parse(savedDemoProfile);
          setProfile(demoRestored);
          setUser({ id: demoRestored.id, email: demoRestored.email });
        } catch {
          // ignore
        }
      }

      if (isSupabaseConfigured() && supabase) {
        try {
          const { data: { session }, error } = await supabase.auth.getSession();
          if (!error && session?.user) {
            setUser(session.user);
            const prof = await fetchSupabaseProfile(session.user.id);
            if (prof) setProfile(prof);
          } else if (!demoRestored) {
            restoreDemoProfile();
          }
        } catch (err) {
          console.warn('Supabase getSession failed, using demo profile:', err);
          if (!demoRestored) restoreDemoProfile();
        }

        try {
          const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
              if (session?.user) {
                setUser(session.user);
                const prof = await fetchSupabaseProfile(session.user.id);
                if (prof) setProfile(prof);
              }
            }
          );
          setLoading(false);
          return () => subscription?.unsubscribe();
        } catch {
          // ignore
        }
      } else {
        if (!demoRestored) restoreDemoProfile();
      }

      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Login handler
  const login = async (email, password) => {
    const cleanEmail = (email || '').trim().toLowerCase();

    // 1. Check if the email matches ANY of our demo/dummy profiles
    // (admin@college.edu, prof.sharma@college.edu, rahul.kumar@college.edu, etc.)
    const profiles = await attendanceService.getProfiles();
    const matchedDemo = profiles.find((p) => p.email.toLowerCase() === cleanEmail);

    if (matchedDemo) {
      setProfile(matchedDemo);
      setUser({ id: matchedDemo.id, email: matchedDemo.email });
      localStorage.setItem('attend_demo_profile', JSON.stringify(matchedDemo));
      return matchedDemo;
    }

    // 2. If it's not a known demo profile and Supabase is configured, try Supabase Auth
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (error) {
          // If Supabase reports user not found or bad credentials:
          throw error;
        }

        const prof = await fetchSupabaseProfile(data.user.id);
        const finalProfile = prof || {
          id: data.user.id,
          email: data.user.email,
          full_name: data.user.user_metadata?.full_name || 'User',
          role: data.user.user_metadata?.role || 'student',
        };

        setProfile(finalProfile);
        setUser(data.user);
        return finalProfile;
      } catch (err) {
        console.warn('Supabase Auth error:', err);

        // If the error was a network fetch failure (like "Failed to fetch"),
        // provide a friendly message and let them know demo accounts work without network
        if (err.message && (err.message.includes('fetch') || err.message.includes('network'))) {
          throw new Error('Supabase database is unreachable. Please use the Quick Fill demo buttons (Admin, Faculty, Student) below to sign in instantly.');
        }

        throw new Error(err.message || 'Invalid email or password.');
      }
    }

    // 3. Fallback for offline / unknown local accounts
    throw new Error('Account not found. Please click one of the Quick Fill Demo credentials below (Admin, Faculty, or Student).');
  };

  // Register handler
  const register = async ({ email, password, full_name, role, student_id, wallet_address }) => {
    const cleanEmail = email.trim().toLowerCase();

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              full_name,
              role,
              student_id: role === 'student' ? student_id : null,
              wallet_address: wallet_address || null,
            },
          },
        });
        if (error) throw error;
        return data;
      } catch (err) {
        console.warn('Supabase signUp error, creating locally:', err);
      }
    }

    // Demo Mode registration
    const newProfile = await attendanceService.createProfile({
      full_name,
      email: cleanEmail,
      role,
      student_id: role === 'student' ? student_id : null,
      wallet_address: wallet_address || null,
    });
    setProfile(newProfile);
    setUser({ id: newProfile.id, email: newProfile.email });
    localStorage.setItem('attend_demo_profile', JSON.stringify(newProfile));
    return newProfile;
  };

  // Logout handler
  const logout = async () => {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Supabase signOut error:', err);
      }
    }
    setUser(null);
    setProfile(null);
    localStorage.removeItem('attend_demo_profile');
  };

  // Switch demo persona (Admin, Faculty, Student) - useful during college viva presentations
  const switchDemoRole = async (targetRole, specificId = null) => {
    const profiles = await attendanceService.getProfiles();
    let targetProfile = null;
    if (specificId) {
      targetProfile = profiles.find((p) => p.id === specificId);
    } else {
      targetProfile = profiles.find((p) => p.role === targetRole);
    }

    if (targetProfile) {
      setProfile(targetProfile);
      setUser({ id: targetProfile.id, email: targetProfile.email });
      localStorage.setItem('attend_demo_profile', JSON.stringify(targetProfile));
      return targetProfile;
    }
  };

  // Link MetaMask wallet to active user profile
  const linkWallet = async (walletAddress) => {
    if (!profile) return;
    try {
      const updated = await attendanceService.updateProfileWallet(profile.id, walletAddress);
      if (updated) {
        setProfile(updated);
        localStorage.setItem('attend_demo_profile', JSON.stringify(updated));
      }
    } catch (err) {
      console.error('Failed to link wallet:', err);
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role: profile?.role || null,
        loading,
        isDemoMode,
        login,
        register,
        logout,
        switchDemoRole,
        linkWallet,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true); // čekamo inicijalizaciju

  const logInUser = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) return { success: false, error: error.message };
    return { success: true, data };
  };

  const logOutUser = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.log("Logout error", error);
    else window.location.reload();
  };

  useEffect(() => {
    // 1. inicijalna sesija
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false); // završeno učitavanje
    });

    // 2. pratimo promene u autentifikaciji
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      },
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // čekamo da sesija bude inicijalizovana pre rendera dece
  if (loading) return null;

  return (
    <AuthContext.Provider value={{ session, logInUser, logOutUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const UserAuth = () => useContext(AuthContext);

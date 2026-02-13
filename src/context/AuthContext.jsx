import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [session, setSession] = useState(undefined);

  const logInUser = async (email,password) => {
    try {
      const {data, error} = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });
      if (error) {
        console.log("Log in error ", error);
        return { success: false, error: error.message };
      } else {
        console.log("Succes log in ", data);
        return { success: true, data };
      }
    } catch (error) {
      console.log("Log in problem ", error);
    }
  };

  const logOutUser = () => {
    const { error } = supabase.auth.signOut;
    if (error) {
      console.log("Log out error ", error);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  return (
    <AuthContext.Provider value={{ session, logInUser, logOutUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const UserAuth = () => {
  return useContext(AuthContext);
};

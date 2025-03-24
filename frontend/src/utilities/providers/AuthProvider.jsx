import React, { createContext, useEffect, useState } from "react";
import { app } from "../../config/firebase.init";
import axios from 'axios'
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
} from "firebase/auth";

export const AuthContext = createContext()

const AuthProvider = ({children}) => {

   const [user, setUser] = useState(null);
   const [loader, setLoader] = useState(true);
   const [error, setError] = useState('');

   const auth = getAuth(app);

   //sign up new user
   const signUp = async (email, password) => {
      try {
         setLoader(true);
         return await createUserWithEmailAndPassword(auth, email, password)
      } catch (error) {
         setError(error.code);
         throw error;
      }
   }

   // login user
   const login = async (email, password) => {
      try {
         setLoader(true);
         return await signInWithEmailAndPassword(auth, email, password);
      } catch (error) {
         setError(error.code);
         throw error;
      }
   }

   // logout user
   const logout = async () => {
      try {
         return await signOut(auth);
      } catch (error) {
         setError(error.code);
         throw error;
      }
   } 

   // update user profile
   const updateUser = async (name, photo) => {
      try {
         await updateProfile(auth.currentUser, {
            displayName: name, photoURL: photo
         });
         setUser(auth.currentUser)
      } catch (error) {
         setError(error.code);
         throw error;
      }
   }

   // google login
   const googleProvider = new GoogleAuthProvider();
   const googleLogin = async () => {
      try {
         setLoader(true);
         return await signInWithPopup(auth, googleProvider);
      } catch (error) {
         setError(error.code);
         throw error;
      }
   }

   // observer for users
   useEffect(() => {
      const unsubscribe = auth.onAuthStateChanged((user) => {
         setUser(user);

         if (user) {
            axios.post('http://localhost:3000/api/auth/set-token', {email: user.email, name: user.displayName})
            .then((data) => {
               if(data.data.token) {
                  localStorage.setItem('token', data.data.token)
                  setLoader(false);
               }
            })
         } else {
            localStorage.removeItem('token');
            setLoader(false);
         }
      })

      return () => unsubscribe();
   }, [])

   const contextValue = {user, signUp, login, logout, updateUser, googleLogin, error, setError, loader, setLoader}
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider

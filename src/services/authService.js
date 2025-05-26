/**
 * Authentication Service
 * Provides helper functions for user login and logout using Firebase Authentication
 */

import { sign } from "chart.js/helpers";
import { auth } from "../firebase/config"
import { signInWithEmailAndPassword } from "firebase/auth"

/**
 * Logs in a user using email and password
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @returns {Promise<UserCredential>} - Firebase Auth user credentials
 */
export const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
};

/**
 * Logs out the currently authenticated user
 * @returns {Promise<void>} - Promise that resolves once the user is signed out
 */
export const logout = () => {
    return signOut(auth);
};
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useEffect, useState } from 'react'
import { useNavigate } from "react-router-dom";
import React from "react";
import { auth } from "../firebase/config";

/**
 * Navbar Component - displays navigation bar with authentication-based UI
 * Shows logout button only when user is authenticated
 * Handles user authentication state and logout functionality
 */

export default function Navbar() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null); // Stores current authenticated user


    /**
     * Sets up Firebase authentication state listener
     * Monitors user login/logout status and updates UI accordingly
     */
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);


    /**
     * Handles user logout process
     * Signs out user from Firebase and redirects to login page
     */
    const handleLogout = async () => {
        try{
        await signOut(auth);
        navigate("/login");
        }catch(err){
            console.error("Logout failed", err);
        }
    }

    return(
        <nav>
            <h1>Plant Buddy 🌿</h1>
            <div>
                {/* Render logout button only when user is authenticated */}
                {user && (
                    <button onClick={handleLogout}>Logout</button>
                )}
            </div>
        </nav>
    );
}
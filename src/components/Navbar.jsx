import { onAuthStateChanged, signOut } from "firebase/auth";
import { useEffect, useState } from 'react'
import { useNavigate } from "react-router-dom";
import React from "react";
import { auth } from "../firebase/config";

export default function Navbar() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

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
                {user? (
                    <button onClick={handleLogout}>Logout</button>
                ) : (
                    <>
                    {/* <button onClick={() => navigate("/login")}>Login</button> */}
                    {/* <button onClick={() => navigate("/register")}>Register</button> */}
                    </>
                )}
            </div>
        </nav>
    );
}
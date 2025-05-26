import { createUserWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase/config";
import { Link } from "react-router-dom";

/**
 * RegisterForm Component - handles new user registration
 * Creates new Firebase user accounts and automatically logs them in
 * Provides navigation to dashboard after successful registration
 */

export default function RegisterForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    /**
     * Handles user registration process
     * Creates new Firebase user account and redirects to dashboard
     * @param {Event} e - form submit event
     */
    const handleRegister = async(e) => {
        e.preventDefault();
        try{
             // Create new user account with Firebase Authentication
            // This automatically logs in the user after successful registration
            await createUserWithEmailAndPassword(auth, email, password);
            navigate("/dashboard");
        }catch(err){
            setError("Registration error");
        }
    }

    return(
        <form onSubmit={handleRegister}>
            <h2>Register</h2>
            {error && <p>{error}</p>}
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button type="submit">Register</button>

            {/* Link to login page for existing users */}
            <p>Have an account? <Link to="/">Log in</Link></p>
        </form>
    );
}
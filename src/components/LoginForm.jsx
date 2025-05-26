import { useState } from "react";
import { login } from "../services/authService";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

/**
 * LoginForm Component - manages user authentication
 * Handles credential input and navigation to dashboard after successful login
 */

export default function LoginForm () {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    /**
     * Main function for handling the login process
     * @param {Event} e - form submit event
     */
    const handleLogin = async (e) => {
        e.preventDefault(); // Prevents page refresh on form submit
        try {
            await login(email, password);
            navigate("/dashboard");
        } catch(err){
            console.error(err);
            setError("Authentication failed");
        }
    };

    return(
        <form onSubmit={handleLogin}>
            <h2>Login</h2>

            {/* Display error message if it exists */}
            {error && <p>{error}</p>}

            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button type="submit">Login</button>

            {/* Link to registration page */}
            <p>Don't have an account? <Link to="/register">Sign up</Link></p>
        </form>
        
    );
}
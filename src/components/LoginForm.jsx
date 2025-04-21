import { useState } from "react";
import { login } from "../services/authService";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

export default function LoginForm () {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
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
            {error && <p>{error}</p>}
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button type="submit">Login</button>
            <p>Don't have an account? <Link to="/register">Sign up</Link></p>
        </form>
        
    );
}
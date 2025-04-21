import { createUserWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase/config";
import { Link } from "react-router-dom";

export default function RegisterForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleRegister = async(e) => {
        e.preventDefault();
        try{
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
            <p>Have an account? <Link to="/">Log in</Link></p>
        </form>
    );
}
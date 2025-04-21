import { sign } from "chart.js/helpers";
import { auth } from "../firebase/config"
import { signInWithEmailAndPassword } from "firebase/auth"

export const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
};

export const logout = () => {
    return signOut(auth);
};
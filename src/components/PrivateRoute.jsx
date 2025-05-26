import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/config";

/**
 * PrivateRoute Component - route guard that protects authenticated-only pages
 * Wraps protected components and ensures only authenticated users can access them
 * Handles loading states and automatic redirects for unauthenticated users
 * @param {React.ReactNode} children - protected components to render if user is authenticated
 */

export default function PrivateRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  /**
   * Sets up Firebase authentication state listener
   * Monitors user authentication status and updates component state accordingly
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user); // Update user state with current auth status
      setLoading(false);  // Authentication check is complete
    });
    // Cleanup function
    return () => unsubscribe();
  }, []);

  if (loading) return <p>Authentification in progress...</p>;

  // Redirect unauthenticated users to login page
  if (!user) {
    return <Navigate to="/" replace />;
  }

  return children;
}

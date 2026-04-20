import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { LogIn, Mail, Lock, Loader2 } from "lucide-react";
import "./Auth.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="auth-card"
      >
        <div className="auth-header">
          <div className="auth-icon-wrapper">
            <LogIn className="auth-icon" size={32} />
          </div>
          <h1>Welcome Back</h1>
          <p>Sign in to continue your journey out of the rat race.</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="error-message">{error}</motion.div>}
          
          <div className="input-group">
            <Mail className="input-icon" size={20} />
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <Lock className="input-icon" size={20} />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" disabled={isLoading} className="submit-btn">
            {isLoading ? <Loader2 className="animate-spin" /> : "Sign In"}
          </button>
        </form>

        <div className="auth-footer">
          <p>Don't have an account? <Link to="/signup">Start Here</Link></p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;

import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  TrendingUp, 
  TrendingDown, 
  LogOut, 
  User,
  Wallet,
  IndianRupee,
  History
} from "lucide-react";
import "./Dashboard.css";

const Dashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("income");
  const [category, setCategory] = useState("General");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, logout } = useContext(AuthContext);

  const fetchData = async () => {
    try {
      const res = await axios.get("http://localhost:7000/api/all", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setTransactions(res.data);
    } catch (err) {
      console.error("Failed to fetch data", err);
    }
  };

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const addTransaction = async (e) => {
    e.preventDefault();
    if (!amount || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await axios.post(
        "http://localhost:7000/api/add",
        {
          type,
          amount: Number(amount),
          category,
        },
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      setAmount("");
      fetchData();
    } catch (err) {
      console.error("Failed to add transaction", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((acc, t) => acc + t.amount, 0);

  const expense = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => acc + t.amount, 0);

  const balance = income - expense;
  const status = expense >= income ? "😓 In Rat Race" : "🚀 Escaping Rat Race";

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-container">
        <header className="dashboard-header">
          <div className="user-profile">
            <div className="user-avatar">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Welcome back,</p>
              <h2 style={{ fontSize: "18px", fontWeight: "600" }}>{user.username}</h2>
            </div>
          </div>
          <button onClick={logout} className="logout-btn">
            <LogOut size={18} />
            Logout
          </button>
        </header>

        <div className="stats-grid">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="stat-card">
            <div className="stat-icon income-icon"><TrendingUp /></div>
            <div className="stat-info">
              <h3>Total Income</h3>
              <p className="income-text">₹{income.toLocaleString()}</p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="stat-card">
            <div className="stat-icon expense-icon"><TrendingDown /></div>
            <div className="stat-info">
              <h3>Total Expense</h3>
              <p className="expense-text">₹{expense.toLocaleString()}</p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="stat-card">
            <div className="stat-icon status-icon"><Wallet /></div>
            <div className="stat-info">
              <h3>Current Status</h3>
              <p style={{ fontSize: "20px" }}>{status}</p>
            </div>
          </motion.div>
        </div>

        <div className="dashboard-main">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="action-card">
            <h2>Add Transaction</h2>
            <form onSubmit={addTransaction} className="transaction-form">
              <div className="input-field">
                <input
                  type="number"
                  placeholder="Amount (₹)"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
              <div className="input-field">
                <select value={type} onChange={(e) => setType(e.target.value)}>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>
              <div className="input-field">
                <input
                  type="text"
                  placeholder="Category (e.g. Salary, Rent)"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </div>
              <button type="submit" disabled={isSubmitting} className="add-btn">
                <Plus size={20} />
                {isSubmitting ? "Adding..." : "Add Transaction"}
              </button>
            </form>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="list-card">
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "24px" }}>
              <History size={20} />
              <h2 style={{ marginBottom: 0 }}>Recent Activities</h2>
            </div>
            
            <div className="transactions-list">
              <AnimatePresence mode="popLayout">
                {transactions.length === 0 ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="empty-state">
                    No transactions yet.
                  </motion.div>
                ) : (
                  transactions.map((t, i) => (
                    <motion.div
                      key={t._id || i}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: i * 0.05 }}
                      className="transaction-item"
                    >
                      <div className="item-left">
                        <div className={`item-type-icon ${t.type === 'income' ? 'income-item-icon' : 'expense-item-icon'}`}>
                          {t.type === 'income' ? <ArrowUpCircle size={18} /> : <ArrowDownCircle size={18} />}
                        </div>
                        <div>
                          <p style={{ fontWeight: "600" }}>{t.category || "General"}</p>
                          <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>{new Date(t.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className={`item-amount ${t.type === 'income' ? 'income-text' : 'expense-text'}`}>
                        {t.type === 'income' ? '+' : '-'} ₹{t.amount.toLocaleString()}
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
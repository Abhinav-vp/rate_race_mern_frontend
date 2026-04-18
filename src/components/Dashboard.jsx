import { useEffect, useState } from "react";
import axios from "axios";
import "./Dashboard.css";

const Dashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("income");

  const fetchData = async () => {
    const res = await axios.get("http://localhost:7000/api/all");
    setTransactions(res.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const addTransaction = async () => {
    await axios.post("http://localhost:7000/api/add", {
      type,
      amount: Number(amount),
    });
    setAmount("");
    fetchData();
  };

  const income = transactions
    .filter(t => t.type === "income")
    .reduce((acc, t) => acc + t.amount, 0);

  const expense = transactions
    .filter(t => t.type === "expense")
    .reduce((acc, t) => acc + t.amount, 0);

  const status =
    expense >= income ? "😓 In Rat Race" : "🚀 Escaping Rat Race";

  return (
    <div>
      <h2>Dashboard</h2>

      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />

      <select onChange={(e) => setType(e.target.value)}>
        <option value="income">Income</option>
        <option value="expense">Expense</option>
      </select>

      <button onClick={addTransaction}>Add</button>

      <h3>Total Income: ₹{income}</h3>
      <h3>Total Expense: ₹{expense}</h3>
      <h2>Status: {status}</h2>

      <ul>
        {transactions.map((t, i) => (
          <li key={i}>
            {t.type} - ₹{t.amount}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;
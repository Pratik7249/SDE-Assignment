import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function Login() {
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validate = (type) => {
    const errs = {};
    if (!username.trim()) errs.username = "Username is required";
    if (!password) errs.password = "Password is required";
    if (type === "signup" && !role) errs.role = "Please select a role";
    return errs;
  };

  const redirectToDashboard = (role, username) => {
    switch (role) {
      case "manager":
        navigate("/manager", { state: { username } });
        break;
      case "employee":
        navigate("/employee", { state: { username } });
        break;
      case "hr":
        navigate("/hr", { state: { username } });
        break;
      case "admin":
        navigate("/admin", { state: { username } });
        break;
      default:
        toast.error("Unknown role");
    }
  };

  const handleLogin = async () => {
    const errs = validate("login");
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Login successful!");
        redirectToDashboard(data.role, username);
      } else {
        setErrors({ server: data.detail || "Invalid login" });
        toast.error(data.detail || "Invalid login");
      }
    } catch (err) {
      console.error("Login error:", err);
      toast.error("Backend not reachable");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    const errs = validate("signup");
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, role }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Signup successful! You can now log in.");
        setUsername("");
        setPassword("");
        setRole("");
      } else {
        toast.error(data.detail || "Signup failed");
      }
    } catch (err) {
      console.error("Signup error:", err);
      toast.error("Backend not reachable");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-6 text-center text-blue-600">
          Feedback Login / Signup
        </h1>

        <input
          className={`w-full p-2 border rounded mb-2 focus:outline-none focus:ring-2 ${
            errors.username ? "border-red-500" : "focus:ring-blue-400"
          }`}
          placeholder="Enter username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        {errors.username && <p className="text-xs text-red-500 mb-2">{errors.username}</p>}

        <input
          type="password"
          className={`w-full p-2 border rounded mb-2 focus:outline-none focus:ring-2 ${
            errors.password ? "border-red-500" : "focus:ring-blue-400"
          }`}
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {errors.password && <p className="text-xs text-red-500 mb-2">{errors.password}</p>}

        <select
          className={`w-full p-2 border rounded mb-2 focus:outline-none focus:ring-2 ${
            errors.role ? "border-red-500" : "focus:ring-blue-400"
          } text-gray-600`}
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="" disabled>
            Select Role (only needed for Signup)
          </option>
          <option value="manager">Manager</option>
          <option value="employee">Employee</option>
          <option value="hr">HR</option>
          <option value="admin">Admin</option>
        </select>
        {errors.role && <p className="text-xs text-red-500 mb-2">{errors.role}</p>}

        <button
          onClick={handleLogin}
          disabled={loading}
          className={`w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 mb-2 ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <button
          onClick={handleSignup}
          disabled={loading}
          className={`w-full border border-blue-600 text-blue-600 py-2 rounded hover:bg-blue-100 ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Signing up..." : "Sign Up"}
        </button>
      </div>
    </div>
  );
}

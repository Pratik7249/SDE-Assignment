import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function Navbar({ username, role }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear(); 
    toast.success("Logged out successfully");
    navigate("/"); 
  };

  return (
    <div className="bg-blue-600 text-white flex justify-between items-center px-6 py-3 shadow">
      <div className="text-lg font-semibold">Feedback System</div>
      <div className="flex items-center gap-4 text-sm">
        <span>
          Logged in as: <span className="font-medium">{username}</span>
        </span>
        <button
          onClick={handleLogout}
          className="bg-white text-blue-600 px-3 py-1 rounded hover:bg-gray-100"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

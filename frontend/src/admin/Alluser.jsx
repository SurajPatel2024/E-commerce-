import React, { useEffect, useState } from "react";
import API from "../api";
import Loading from "../components/Loading";
function Alluser() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [confirmUserId, setConfirmUserId] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await API.get("/admin/users", { withCredentials: true });
      setUsers(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch users");
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    try {
      await API.delete(`/admin/users/${userId}`, { withCredentials: true });
      setUsers(users.filter((u) => u._id !== userId));
      setMessage("User deleted successfully!");
      setConfirmUserId(null);
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error(err);
      setMessage("Failed to delete user");
      setConfirmUserId(null);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const askDelete = (userId) => setConfirmUserId(userId);

 
   if (loading) return <Loading text="Loading users..." />;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>All Users</h2>

      {message && <div style={popupStyle}>{message}</div>}

      {users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <div style={tableContainer}>
          {users.map((user, index) => (
            <div key={user._id} style={cardStyle}>
              <p><strong>#{index + 1}</strong></p>
              <p><strong>Name:</strong> {user.name}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Role:</strong> {user.isAdmin ? "Admin" : "User"}</p>
              {!user.isAdmin && (
                <>
                  {confirmUserId === user._id ? (
                    <div style={confirmStyle}>
                      <span>Delete?</span>
                      <button
                        onClick={() => handleDelete(user._id)}
                        style={confirmBtnStyle}
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => setConfirmUserId(null)}
                        style={cancelBtnStyle}
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => askDelete(user._id)}
                      style={deleteBtnStyle}
                    >
                      Delete
                    </button>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const tableContainer = {
  display: "flex",
  flexDirection: "column",
  gap: "15px",
};

const cardStyle = {
  padding: "15px",
  border: "1px solid #ddd",
  borderRadius: "8px",
  backgroundColor: "#f9f9f9",
  boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
};

const popupStyle = {
  padding: "10px 15px",
  marginBottom: "15px",
  backgroundColor: "#4caf50",
  color: "white",
  borderRadius: "5px",
  fontWeight: "600",
};

const confirmStyle = {
  display: "flex",
  gap: "10px",
  marginTop: "8px",
  alignItems: "center",
};

const deleteBtnStyle = {
  padding: "6px 12px",
  backgroundColor: "#ff4d4f",
  color: "white",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
  marginTop: "8px",
};

const confirmBtnStyle = {
  padding: "4px 10px",
  backgroundColor: "#ff4d4f",
  color: "white",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
};

const cancelBtnStyle = {
  padding: "4px 10px",
  backgroundColor: "#ccc",
  color: "black",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
};

export default Alluser;

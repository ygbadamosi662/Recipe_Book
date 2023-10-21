import React, { useState } from "react";
import "./Profile.css";
const Profile = () => {
  const [user, setUser] = useState({
    username: "Arafat_motolani",
    email: "arafat.motolani@example.com",
    profilePicture:
      "http://t3.gstatic.com/licensed-image?q=tbn:ANd9GcRvC27D9KlxeEham1w-Wpd_pu3hd4A-OywxRbdnx9JFLpcTD7dfL0bD_WI6Ro8QkzrPLkBMzA9osrMpi4JSP5Y",
  });

  const [editing, setEditing] = useState(false);

  const handleEdit = () => {
    setEditing(true);
  };

  const handleSave = () => {
    setEditing(false);
    // Here, you would typically send the updated user data to your server
  };

  return (
    <div className="profile-page">
      <h2>My Profile</h2>
      <div className="profile-info">
        <img src={user.profilePicture} alt="Profile" />
        {editing ? (
          <div className="edit-form">
            <input
              type="text"
              placeholder="Username"
              value={user.username}
              onChange={(e) => setUser({ ...user, username: e.target.value })}
            />
            <input
              type="email"
              placeholder="Email"
              value={user.email}
              onChange={(e) => setUser({ ...user, email: e.target.value })}
            />
            <button onClick={handleSave}>Save</button>
          </div>
        ) : (
          <div className="user-details">
            <h3>{user.username}</h3>
            <p>{user.email}</p>
          </div>
        )}
        <button onClick={handleEdit} className="edit-button">
          {editing ? "Cancel" : "Edit Profile"}
        </button>
      </div>
    </div>
  );
};

export default Profile;

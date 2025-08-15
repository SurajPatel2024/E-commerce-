// src/components/Loading.jsx
import React from "react";

export default function Loading({ text = "Loading..." }) {
  return (
    <div style={{
      textAlign: "center",
      marginTop: 40,
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    }}>
      <div className="spinner" style={{
        margin: "auto",
        marginBottom: 10,
        width: 40,
        height: 40,
        border: "5px solid #f3f3f3",
        borderTop: "5px solid #ff4800ff",
        borderRadius: "50%",
        animation: "spin 1s linear infinite"
      }}></div>
      <p>{text}</p>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

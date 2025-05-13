import React from "react";

function ToastNotification({ showToast, toastMsg }) {
  return showToast ? (
    <div style={{
      position: 'fixed',
      bottom: 32,
      right: 32,
      background: 'linear-gradient(90deg, #ff5858 0%, #f09819 100%)',
      color: '#fff',
      padding: '0.7rem 1.3rem',
      borderRadius: '0.6rem',
      boxShadow: '0 4px 16px rgba(255, 88, 88, 0.15)',
      display: 'flex',
      alignItems: 'center',
      gap: '0.7rem',
      fontWeight: 500,
      fontSize: '1rem',
      letterSpacing: '0.01em',
      border: '1px solid #ff5858',
      zIndex: 2000,
      opacity: showToast ? 1 : 0,
      transition: 'opacity 0.5s',
      minWidth: 180,
      maxWidth: 320
    }}>
      <span style={{fontSize: '1.2rem', fontWeight: 'bold', lineHeight: 1}}>&#9888;</span>
      <span>{toastMsg}</span>
    </div>
  ) : null;
}

export default ToastNotification; 
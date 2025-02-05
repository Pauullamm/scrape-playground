import React from 'react';
import whiteDogLogo from '../../assets/img/whiteDogLogo.png'
import './Popup.css';

export default function Popup() {
  const openMainApp = () => {
    window.open('https://terrier-hunt.netlify.app/home', '_blank');
  };

  return (
    <div className="popup-container">
      <div className="header">
        <img src={whiteDogLogo} className="logo" alt="terrier pup logo" />
        <h1 className="title">Terrier Pup</h1>
      </div>
      
      <div className="content">
        <p className="description">
          Your faithful companion for seamless hunting on the web!
        </p>
        
        <button 
          className="cta-button"
          onClick={openMainApp}
        >
          🐾 Open Terrier App
        </button>
      </div>
    </div>
  );
};
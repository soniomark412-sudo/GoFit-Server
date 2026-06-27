// Desc: Footer component for the application
// The Footer component displays the footer of the application.

// MAYBE WE CAN CHANGE THE DESIGN FOR MORE ATTRACTIVE LOOK (BLACK, RED, WHITE, diff font?)

import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white text-secondary text-center footer">
      <div className="container">
        <p className="mb-2">Gym Master &copy; {new Date().getFullYear()}</p>
      </div>
    </footer>
  );
};

export default Footer;
import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <p>&copy; {currentYear} Employee Management System. All rights reserved.</p>
    </footer>
  );
};

export default Footer;

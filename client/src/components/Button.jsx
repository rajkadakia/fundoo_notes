import React from 'react';
import './Button.css'; // We'll create this or use modules

const Button = ({ children, onClick, type = 'button', variant = 'primary', className = '', ...props }) => {
  return (
    <button 
      type={type} 
      onClick={onClick} 
      className={`btn btn-${variant} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;

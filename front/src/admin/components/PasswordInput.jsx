import React, { useState } from 'react';

const PasswordInput = ({ 
    id, 
    name = "pwd", 
    value, 
    onChange, 
    placeholder = "", 
    className = "form-control h-25 w-50",
    style = {}
}) => {
    const [showPassword, setShowPassword] = useState(false);

    const togglePassword = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="position-relative" style={{ ...style }}>
            <input 
                type={showPassword ? "text" : "password"}
                className={className}
                id={id}
                placeholder={placeholder}
                name={name}
                value={value}
                onChange={onChange}
                style={{ paddingRight: '40px' }}
            />
            <button
                type="button"
                onClick={togglePassword}
                style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0',
                    fontSize: '18px',
                    color: '#666',
                    lineHeight: 1
                }}
                title={showPassword ? "Ocultar senha" : "Mostrar senha"}
            >
                {showPassword ? (
                    <i className="fa fa-eye-slash" aria-hidden="true"></i>
                ) : (
                    <i className="fa fa-eye" aria-hidden="true"></i>
                )}
            </button>
        </div>
    );
};

export default PasswordInput;

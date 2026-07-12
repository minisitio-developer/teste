import React from 'react';

export default function BiCard({ icon, title, value, subtitle, link, linkText, color = '#0d6efd', children }) {
  return (
    <div className="card border-0 shadow-sm h-100" style={{ borderRadius: 12 }}>
      <div className="card-body d-flex flex-column">
        <div className="d-flex align-items-center gap-2 mb-2">
          {icon && <span style={{ color, fontSize: '1.2rem' }}>{icon}</span>}
          <small className="text-uppercase fw-semibold text-muted" style={{ fontSize: '0.7rem', letterSpacing: 0.5 }}>
            {title}
          </small>
        </div>
        <div className="mt-auto">
          {value !== undefined && value !== null && (
            <h3 className="mb-0 fw-bold" style={{ color: '#1a1a2e' }}>
              {typeof value === 'number' ? Number(value).toLocaleString('pt-BR') : value}
            </h3>
          )}
          {subtitle && <small className="text-muted">{subtitle}</small>}
          {children}
        </div>
        {link && (
          <a href={link} className="text-decoration-none mt-2" style={{ fontSize: '0.8rem', color }}>
            {linkText || 'Ver relatório'} →
          </a>
        )}
      </div>
    </div>
  );
}

function PageLayout({ children, className = '' }) {
  return (
    <div className={`page-wrapper ${className}`}>
      {children}
    </div>
  );
}

export default PageLayout;

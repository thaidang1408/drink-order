export const Card = ({ children, className = '', interactive = false }) => (
  <div className={`${interactive ? 'card-interactive' : 'card'} p-4 ${className}`}>
    {children}
  </div>
);

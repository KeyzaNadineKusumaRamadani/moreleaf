import { useEffect } from 'react';

export const EmptyState = ({ icon = '🍃', title, description, action }) => (
  <div className="text-center py-16 px-4">
    <div className="text-5xl mb-4">{icon}</div>
    <h3 className="font-display font-semibold text-lg mb-1">{title}</h3>
    {description && <p className="text-gray-500 text-sm max-w-sm mx-auto mb-4">{description}</p>}
    {action}
  </div>
);

export const Seo = ({ title, description }) => {
  useEffect(() => {
    if (title) document.title = `${title} | Moreleaf`;
    if (description) {
      const meta = document.querySelector('meta[name="description"]');
      if (meta) meta.setAttribute('content', description);
    }
  }, [title, description]);
  return null;
};

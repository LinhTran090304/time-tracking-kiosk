import React from 'react';

interface AvatarProps {
  name: string;
  imageUrl?: string;
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ name, imageUrl, className = '' }) => {
  const getInitials = (name: string): string => {
    const names = name.trim().split(' ');
    if (names.length === 1 && names[0] !== '') {
      return names[0].substring(0, 2).toUpperCase();
    }
    if (names.length > 1) {
        const firstInitial = names[0][0];
        const lastInitial = names[names.length - 1][0];
        return `${firstInitial}${lastInitial}`.toUpperCase();
    }
    return '??';
  };

  const generateColorClass = (name: string): string => {
    const colors = [
        'bg-red-500', 'bg-yellow-500', 'bg-green-500', 'bg-blue-500', 'bg-indigo-500', 
        'bg-purple-500', 'bg-pink-500', 'bg-teal-500', 'bg-orange-500'
    ];
    let hash = 0;
    if (name.length === 0) return colors[0];
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
      hash = hash & hash; // Convert to 32bit integer
    }
    const index = Math.abs(hash % colors.length);
    return colors[index];
  };

  const baseClasses = "w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center";
  
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name}
        className={`${baseClasses} object-cover ${className}`}
      />
    );
  }
  
  const initials = getInitials(name);
  const colorClass = generateColorClass(name);

  return (
    <div className={`${baseClasses} ${colorClass} ${className}`}>
      <span className="text-white font-bold text-2xl sm:text-3xl select-none tracking-tighter">{initials}</span>
    </div>
  );
};

export default Avatar;

import React, { useState, useEffect } from 'react';

const StatsCard = ({ title, value, icon, color = "blue" }) => {
  const [animatedValue, setAnimatedValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const colorClasses = {
    blue: {
      gradient: "bg-gradient-to-br from-blue-500 to-blue-600",
      lightBg: "bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20",
      border: "border-blue-200 dark:border-blue-800",
      iconBg: "bg-blue-100 dark:bg-blue-800",
      iconColor: "text-blue-600 dark:text-blue-300",
      textGradient: "bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent",
      shadow: "shadow-blue-200 dark:shadow-blue-900/50"
    },
    green: {
      gradient: "bg-gradient-to-br from-green-500 to-emerald-600",
      lightBg: "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20",
      border: "border-green-200 dark:border-green-800",
      iconBg: "bg-green-100 dark:bg-green-800",
      iconColor: "text-green-600 dark:text-green-300",
      textGradient: "bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent",
      shadow: "shadow-green-200 dark:shadow-green-900/50"
    },
    yellow: {
      gradient: "bg-gradient-to-br from-yellow-500 to-amber-500",
      lightBg: "bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20",
      border: "border-yellow-200 dark:border-yellow-800",
      iconBg: "bg-yellow-100 dark:bg-yellow-800",
      iconColor: "text-yellow-600 dark:text-yellow-300",
      textGradient: "bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent",
      shadow: "shadow-yellow-200 dark:shadow-yellow-900/50"
    },
    purple: {
      gradient: "bg-gradient-to-br from-purple-500 to-pink-600",
      lightBg: "bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20",
      border: "border-purple-200 dark:border-purple-800",
      iconBg: "bg-purple-100 dark:bg-purple-800",
      iconColor: "text-purple-600 dark:text-purple-300",
      textGradient: "bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent",
      shadow: "shadow-purple-200 dark:shadow-purple-900/50"
    },
    red: {
      gradient: "bg-gradient-to-br from-red-500 to-rose-600",
      lightBg: "bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20",
      border: "border-red-200 dark:border-red-800",
      iconBg: "bg-red-100 dark:bg-red-800",
      iconColor: "text-red-600 dark:text-red-300",
      textGradient: "bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent",
      shadow: "shadow-red-200 dark:shadow-red-900/50"
    }
  };

  // Number animation effect
  useEffect(() => {
    setIsVisible(true);
    if (typeof value === 'number') {
      let start = 0;
      const end = value;
      const duration = 2000; // 2 seconds
      const increment = end / (duration / 16); // 60fps

      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setAnimatedValue(end);
          clearInterval(timer);
        } else {
          setAnimatedValue(Math.floor(start));
        }
      }, 16);

      return () => clearInterval(timer);
    }
  }, [value]);

  const displayValue = typeof value === 'number' ? animatedValue : value;

  return (
    <div className={`
      group relative overflow-hidden ${colorClasses[color].lightBg} 
      rounded-xl border ${colorClasses[color].border} 
      shadow-lg ${colorClasses[color].shadow} 
      hover:shadow-xl transform hover:scale-105 
      transition-all duration-500 cursor-pointer
      ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
    `}>
      {/* Background Animation Circles */}
      <div className="absolute -top-8 -right-8 w-16 h-16 bg-white/10 rounded-full group-hover:scale-125 transition-transform duration-700"></div>
      <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-white/5 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
      
      {/* Gradient Overlay on Hover */}
      <div className={`absolute inset-0 ${colorClasses[color].gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-xl`}></div>
      
      <div className="relative p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Icon Section */}
            <div className={`${colorClasses[color].iconBg} p-4 rounded-xl mb-4 shadow-md group-hover:scale-110 transition-transform duration-300`}>
              <div className={`text-2xl ${colorClasses[color].iconColor}`}>
                {icon}
              </div>
            </div>
            
            {/* Title */}
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2 tracking-wide uppercase">
              {title}
            </h3>
            
            {/* Value */}
            <p className={`text-4xl font-bold ${colorClasses[color].textGradient} tracking-tight leading-none`}>
              {displayValue}
            </p>
          </div>
          
          {/* Decorative Element */}
          <div className="opacity-20 group-hover:opacity-40 transition-opacity duration-300">
            <div className={`w-2 h-16 ${colorClasses[color].gradient} rounded-full`}></div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-6 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
          <div 
            className={`h-full ${colorClasses[color].gradient} rounded-full transition-all duration-2000 ease-out`}
            style={{ 
              width: isVisible ? '100%' : '0%',
              transitionDelay: '300ms'
            }}
          ></div>
        </div>
        
        {/* Pulse Animation for Numbers */}
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className={`w-3 h-3 ${colorClasses[color].gradient} rounded-full animate-pulse`}></div>
        </div>
      </div>
      
      {/* Shine Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
    </div>
  );
};

export default StatsCard; 
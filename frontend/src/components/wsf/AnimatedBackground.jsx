import React from 'react';

const BACKGROUND_IMAGES = [
  '/images/bg/bg2.jpg',
  '/images/bg/bg3.png',
];

const AnimatedBackground = () => {
  const imageCount = BACKGROUND_IMAGES.length;
  const totalDuration = imageCount * 8;

  return (
    <div className="fixed inset-0 z-0 overflow-hidden">

      {/* Overlay léger (optionnel) */}
      <div className="absolute inset-0 bg-white/5 z-10 pointer-events-none"></div>

      {BACKGROUND_IMAGES.map((image, index) => (
        <div
          key={index}
          className="absolute inset-0 bg-cover bg-center bg-no-repeat animate-crossfade"
          style={{
            backgroundImage: `url(${image})`,
            animationDelay: `${index * 8}s`,
            animationDuration: `${totalDuration}s`,
            opacity: index === 0 ? 1 : 0
          }}
        />
      ))}
    </div>
  );
};

export default AnimatedBackground;
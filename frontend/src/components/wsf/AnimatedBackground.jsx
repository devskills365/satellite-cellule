import React from 'react';

const BACKGROUND_IMAGES = [
  '/images/bg/bg1.jpg',
  '/images/bg/index.png',
];

const AnimatedBackground = () => {
  const imageCount = BACKGROUND_IMAGES.length;
  const totalDuration = imageCount * 8;

  return (
    <div className="fixed inset-0 z-0 overflow-hidden">
      {/* Overlay plus sombre pour améliorer la lisibilité */}
      <div className="absolute inset-0 bg-black/40 z-10 pointer-events-none"></div>

      {/* Filtre de flou sur l'ensemble du fond */}
      <div className="absolute inset-0 backdrop-blur-sm z-[5] pointer-events-none"></div>

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
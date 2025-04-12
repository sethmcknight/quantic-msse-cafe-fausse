import React, { useState, useEffect, useCallback } from 'react';
import '../css/GalleryPage.css';
import menuItemImg from '../assets/menu-item.jpg';
import specialEventImg from '../assets/gallery-special-event.jpg';
import ribeyeSteakImg from '../assets/gallery-ribeye-steak.jpg';
import cafeInteriorImg from '../assets/gallery-cafe-interior.jpg';

const GalleryPage: React.FC = () => {
  const images = [
    { src: menuItemImg, alt: 'Menu Item', id: 'img1' },
    { src: specialEventImg, alt: 'Special Event', id: 'img2' },
    { src: ribeyeSteakImg, alt: 'Ribeye Steak', id: 'img3' },
    { src: cafeInteriorImg, alt: 'Cafe Interior', id: 'img4' },
  ];
  
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = useCallback((e?: React.MouseEvent) => {
    if (e) {
      // Only close if clicking directly on the lightbox background, not on the content
      if (e.target === e.currentTarget) {
        setLightboxOpen(false);
      }
    } else {
      setLightboxOpen(false);
    }
  }, []);

  const navigateImages = useCallback((direction: 'prev' | 'next') => {
    setCurrentImageIndex(prevIndex => {
      if (direction === 'prev') {
        return prevIndex === 0 ? images.length - 1 : prevIndex - 1;
      } else {
        return prevIndex === images.length - 1 ? 0 : prevIndex + 1;
      }
    });
  }, [images.length]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxOpen) return;
      
      if (e.key === 'Escape') {
        closeLightbox();
      } else if (e.key === 'ArrowLeft') {
        navigateImages('prev');
      } else if (e.key === 'ArrowRight') {
        navigateImages('next');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [lightboxOpen, navigateImages, closeLightbox]);

  // Prevent body scrolling when lightbox is open
  useEffect(() => {
    if (lightboxOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [lightboxOpen]);

  return (
    <div className="gallery-page">
      <h1>Gallery</h1>
      
      {/* Gallery Grid */}
      <div className="gallery-grid">
        {images.map((img, index) => (
          <div key={img.id} className="gallery-item" onClick={() => openLightbox(index)}>
            <img src={img.src} alt={img.alt} />
          </div>
        ))}
      </div>
      
      {/* Lightbox Modal with Carousel */}
      {lightboxOpen && (
        <div className="lightbox" onClick={closeLightbox}>
          <div className="lightbox-content" onClick={e => e.stopPropagation()}>
            <img src={images[currentImageIndex].src} alt={images[currentImageIndex].alt} />
            <button className="lightbox-nav lightbox-nav-prev" onClick={() => navigateImages('prev')}>
              &#10094;
            </button>
            <button className="lightbox-nav lightbox-nav-next" onClick={() => navigateImages('next')}>
              &#10095;
            </button>
            <div className="lightbox-counter">{currentImageIndex + 1} / {images.length}</div>
          </div>
          <button className="lightbox-close" onClick={closeLightbox}>×</button>
        </div>
      )}

      {/* Awards Section */}
      <section className="awards-section">
        <h2>Our Awards</h2>
        <ul className="awards-list">
          <li>Culinary Excellence Award – 2022</li>
          <li>Restaurant of the Year – 2023</li>
          <li>Best Fine Dining Experience – Foodie Magazine, 2023</li>
        </ul>
      </section>
      
      {/* Customer Testimonials Section */}
      <section className="reviews-section">
        <h2>Customer Testimonials</h2>
        <div className="testimonial">
          <p>"Exceptional ambiance and unforgettable flavors."</p>
          <span>– Gourmet Review</span>
        </div>
        <div className="testimonial">
          <p>"A must-visit restaurant for food enthusiasts."</p>
          <span>– The Daily Bite</span>
        </div>
      </section>
    </div>
  );
};

export default GalleryPage;
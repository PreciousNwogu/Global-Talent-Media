import { useEffect, useState } from 'react';
import { resolveMediaUrl } from '../../utils/media';

const VideoSlider = ({ event }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [failedMediaUrls, setFailedMediaUrls] = useState([]);

  useEffect(() => {
    setCurrentIndex(0);
    setFailedMediaUrls([]);
  }, [event?.id]);

  const isEmbedVideoUrl = (url) => {
    if (!url) return false;
    return url.includes('youtube.com/embed/') || url.includes('player.vimeo.com/video/');
  };

  // Combine video and gallery images into a slideshow array
  const slides = [];
  
  // Add video as first slide if available
  if (event.video_url) {
    const resolvedVideoUrl = resolveMediaUrl(event.video_url);

    if (!failedMediaUrls.includes(resolvedVideoUrl)) {
      slides.push({
        type: 'video',
        url: resolvedVideoUrl,
        isEmbed: isEmbedVideoUrl(resolvedVideoUrl),
      });
    }
  }
  
  // Add cover image
  if (event.cover_image) {
    slides.push({
      type: 'image',
      url: resolveMediaUrl(event.cover_image),
    });
  }
  
  // Add gallery images
  if (event.gallery_images && Array.isArray(event.gallery_images)) {
    event.gallery_images.forEach((img) => {
      const resolvedImageUrl = resolveMediaUrl(img);

      if (!failedMediaUrls.includes(resolvedImageUrl)) {
        slides.push({
          type: 'image',
          url: resolvedImageUrl,
        });
      }
    });
  }

  useEffect(() => {
    if (currentIndex >= slides.length) {
      setCurrentIndex(0);
    }
  }, [currentIndex, slides.length]);

  if (slides.length === 0) {
    return (
      <div className="w-full h-96 bg-gray-200 flex items-center justify-center">
        <p className="text-gray-500">No media available</p>
      </div>
    );
  }

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  const currentSlide = slides[currentIndex];

  const hideFailedSlide = (url) => {
    setFailedMediaUrls((prev) => (prev.includes(url) ? prev : [...prev, url]));
    setCurrentIndex(0);
  };

  return (
    <div className="relative w-full h-96 md:h-[500px] rounded-lg overflow-hidden bg-black">
      {/* Video/Image Display */}
      {currentSlide.type === 'video' ? (
        currentSlide.isEmbed ? (
          <iframe
            src={currentSlide.url}
            className="w-full h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="Event video"
            onError={() => hideFailedSlide(currentSlide.url)}
          ></iframe>
        ) : (
          <video
            src={currentSlide.url}
            controls
            className="w-full h-full object-cover"
            onError={() => hideFailedSlide(currentSlide.url)}
          >
            Your browser does not support the video tag.
          </video>
        )
      ) : (
        <img
          src={currentSlide.url}
          alt={`Event slide ${currentIndex + 1}`}
          className="w-full h-full object-cover"
          onError={() => hideFailedSlide(currentSlide.url)}
        />
      )}

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
            aria-label="Previous slide"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
            aria-label="Next slide"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </>
      )}

      {/* Slide Indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-white w-8'
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Slide Type Indicator */}
      {currentSlide.type === 'video' && (
        <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
          Video
        </div>
      )}
    </div>
  );
};

export default VideoSlider;


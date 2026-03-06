"use client";

import { useState, useEffect, useRef, memo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Slide = {
  id: number;
  image: string;
  alt: string;
};

const slides: Slide[] = [
  {
    id: 1,
    image: "/kids_slider_1.jfif",
    alt: "Kids' Fashion Sale"
  },
  {
    id: 2,
    image: "/kids_slider_2.webp",
    alt: "Kids' Party Wear"
  },
  {
    id: 3,
    image: "/kids_slider_3.webp",
    alt: "Kids' Casual Collection"
  },
  {
    id: 4,
    image: "/kids_slider_4.webp",
    alt: "Kids' Accessories"
  }
];

const AUTO_SLIDE_TIME = 4000;

export default memo(function KidsCategorySlider() {
  const [index, setIndex] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  /* AUTO SLIDE */
  useEffect(() => {
    resetTimer();

    timeoutRef.current = setTimeout(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, AUTO_SLIDE_TIME);

    return () => resetTimer();
  }, [index]);

  const resetTimer = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  /*  BUTTONS  */
  const prevSlide = () => {
    resetTimer();
    setIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    resetTimer();
    setIndex((prev) => (prev + 1) % slides.length);
  };

  return (
    <section className="relative w-full overflow-hidden bg-gray-100">
      <div className="relative w-full h-[280px] sm:h-[350px] md:h-[420px] lg:h-[500px] xl:h-[550px]">
        {/* Single slide */}
        <div className="absolute inset-0 w-full h-full">
          <img
            src={slides[index].image}
            alt={slides[index].alt}
            className="w-full h-full object-cover"
            loading="eager"
          />

          <div className="absolute inset-0 bg-black/10" />
        </div>

        {/* Navigation Buttons */}
        <button
          onClick={prevSlide}
          className="absolute left-4 sm:left-6 md:left-8 top-1/2 -translate-y-1/2
          bg-white/90 hover:bg-white text-gray-800 p-3 sm:p-4 rounded-full shadow-lg z-10
          transition-all duration-300 hover:scale-110"
          aria-label="Previous slide"
        >
          <ChevronLeft size={22} className="sm:w-6 sm:h-6" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-4 sm:right-6 md:right-8 top-1/2 -translate-y-1/2
          bg-white/90 hover:bg-white text-gray-800 p-3 sm:p-4 rounded-full shadow-lg z-10
          transition-all duration-300 hover:scale-110"
          aria-label="Next slide"
        >
          <ChevronRight size={22} className="sm:w-6 sm:h-6" />
        </button>

        {/* Dots Indicator */}
        <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex gap-2 sm:gap-3 z-10">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                resetTimer();
                setIndex(i);
              }}
              className={`h-2 sm:h-2.5 rounded-full transition-all duration-300
              ${i === index 
                ? "w-6 sm:w-8 bg-indigo-500" 
                : "w-2 sm:w-2.5 bg-white/60 hover:bg-white/80"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
});
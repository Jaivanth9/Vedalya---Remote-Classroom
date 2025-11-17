import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import liveClassesImg from "@/assets/feature-live-classes.jpg";
import aiChatbotImg from "@/assets/feature-ai-chatbot.jpg";
import analyticsImg from "@/assets/feature-analytics.jpg";
import ruralAccessImg from "@/assets/feature-rural-access.jpg";

const FeatureShowcase = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      image: liveClassesImg,
      title: "Live & Recorded Classes",
      description: "Join interactive live sessions or access recorded lectures anytime. Features include real-time chat, subtitles in multiple languages, and high-quality video streaming optimized for low bandwidth connections."
    },
    {
      image: aiChatbotImg,
      title: "AI-Powered Multilingual Chatbot",
      description: "Get instant doubt clarification in English, Hindi, or Telugu. Our intelligent assistant helps you understand concepts better, provides study tips, and answers questions 24/7 in your preferred language."
    },
    {
      image: analyticsImg,
      title: "Smart Analytics & Progress Tracking",
      description: "Track your learning journey with detailed insights. View performance metrics, study roadmaps, quiz accuracy, and receive AI-generated recommendations to improve your academic outcomes."
    },
    {
      image: ruralAccessImg,
      title: "Accessible Education for Rural Students",
      description: "Breaking barriers to quality education. Designed specifically for rural students with offline access, low-bandwidth optimization, and devices compatibility to ensure everyone can learn anytime, anywhere."
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Experience Veदlya's Powerful Features
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover how our platform transforms the learning experience with cutting-edge technology
          </p>
        </div>

        <div className="relative max-w-5xl mx-auto">
          {/* Main Slideshow */}
          <div className="relative overflow-hidden rounded-2xl shadow-2xl aspect-video bg-muted">
            {slides.map((slide, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-transform duration-500 ease-in-out ${
                  index === currentSlide
                    ? "translate-x-0 opacity-100"
                    : index < currentSlide
                    ? "-translate-x-full opacity-0"
                    : "translate-x-full opacity-0"
                }`}
              >
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                  <h3 className="text-2xl sm:text-3xl font-bold mb-3">{slide.title}</h3>
                  <p className="text-sm sm:text-base opacity-90 max-w-3xl">
                    {slide.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Buttons */}
          <Button
            variant="secondary"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full shadow-lg hover:scale-110 transition-transform"
            onClick={prevSlide}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full shadow-lg hover:scale-110 transition-transform"
            onClick={nextSlide}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-6">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? "w-8 bg-primary"
                    : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeatureShowcase;

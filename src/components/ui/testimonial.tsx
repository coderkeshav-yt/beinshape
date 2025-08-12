
import * as React from "react"
import { motion, PanInfo } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface Testimonial {
  id: number | string
  name: string
  avatar: string
  description: string
}

interface TestimonialCarouselProps
  extends React.HTMLAttributes<HTMLDivElement> {
  testimonials: Testimonial[]
  showArrows?: boolean
  showDots?: boolean
}

const TestimonialCarousel = React.forwardRef<
  HTMLDivElement,
  TestimonialCarouselProps
>(
  (
    { className, testimonials, showArrows = true, showDots = true, ...props },
    ref,
  ) => {
    const [currentIndex, setCurrentIndex] = React.useState(0)
    const [exitX, setExitX] = React.useState<number>(0)

    const nextTestimonial = () => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    }

    const prevTestimonial = () => {
      setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
    }

    const handleDragEnd = (
      event: MouseEvent | TouchEvent | PointerEvent,
      info: PanInfo,
    ) => {
      if (Math.abs(info.offset.x) > 100) {
        if (info.offset.x > 0) {
          prevTestimonial()
        } else {
          nextTestimonial()
        }
      }
    }

    // Auto-advance testimonials
    React.useEffect(() => {
      const interval = setInterval(() => {
        nextTestimonial()
      }, 5000)

      return () => clearInterval(interval)
    }, [])

    return (
      <div
        ref={ref}
        className={cn(
          "h-72 w-full flex items-center justify-center relative",
          className
        )}
        {...props}
      >
        {/* Navigation Arrows */}
        {showArrows && (
          <>
            <button
              onClick={prevTestimonial}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/10 dark:bg-black/20 backdrop-blur-sm border border-white/20 hover:bg-white/20 dark:hover:bg-black/30 transition-all text-gray-700 dark:text-gray-300 hover:text-[#e3bd30]"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={nextTestimonial}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/10 dark:bg-black/20 backdrop-blur-sm border border-white/20 hover:bg-white/20 dark:hover:bg-black/30 transition-all text-gray-700 dark:text-gray-300 hover:text-[#e3bd30]"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        <div className="relative w-80 h-64">
          {testimonials.map((testimonial, index) => {
            const isCurrentCard = index === currentIndex
            const isPrevCard =
              index === (currentIndex + 1) % testimonials.length
            const isNextCard =
              index === (currentIndex + 2) % testimonials.length

            if (!isCurrentCard && !isPrevCard && !isNextCard) return null

            return (
              <motion.div
                key={testimonial.id}
                className={cn(
                  "absolute w-full h-full rounded-2xl cursor-grab active:cursor-grabbing",
                  "bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-xl border border-gray-200/50 dark:border-white/10",
                )}
                style={{
                  zIndex: isCurrentCard ? 3 : isPrevCard ? 2 : 1,
                }}
                drag={isCurrentCard ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.7}
                onDragEnd={isCurrentCard ? handleDragEnd : undefined}
                initial={{
                  scale: 0.95,
                  opacity: 0,
                  y: isCurrentCard ? 0 : isPrevCard ? 8 : 16,
                  rotate: isCurrentCard ? 0 : isPrevCard ? -2 : -4,
                }}
                animate={{
                  scale: isCurrentCard ? 1 : 0.95,
                  opacity: isCurrentCard ? 1 : isPrevCard ? 0.6 : 0.3,
                  x: isCurrentCard ? exitX : 0,
                  y: isCurrentCard ? 0 : isPrevCard ? 8 : 16,
                  rotate: isCurrentCard ? exitX / 20 : isPrevCard ? -2 : -4,
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                }}
              >
                <div className="p-6 flex flex-col items-center gap-4 h-full justify-center">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-[#e3bd30]/30"
                  />
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white font-dejanire">
                    {testimonial.name}
                  </h3>
                  <p className="text-center text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    {testimonial.description}
                  </p>
                </div>
              </motion.div>
            )
          })}
          
          {showDots && (
            <div className="absolute -bottom-8 left-0 right-0 flex justify-center gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all duration-300",
                    index === currentIndex
                      ? "bg-[#e3bd30] w-8"
                      : "bg-gray-300 dark:bg-gray-600 hover:bg-[#e3bd30]/50",
                  )}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    )
  },
)
TestimonialCarousel.displayName = "TestimonialCarousel"

export { TestimonialCarousel, type Testimonial }


import CircularNav from '@/components/CircularNav';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';

const Gallery = () => {
  const galleryImages = [
    {
      url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&h=600",
      title: "Strength Training"
    },
    {
      url: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&h=600",
      title: "Cardio Workouts"
    },
    {
      url: "https://images.unsplash.com/photo-1550345332-09e3ac987658?auto=format&fit=crop&w=800&h=600",
      title: "Yoga & Flexibility"
    },
    {
      url: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=800&h=600",
      title: "Group Training"
    },
    {
      url: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&h=600",
      title: "Personal Training"
    },
    {
      url: "https://images.unsplash.com/photo-1544216717-3bbf52512659?auto=format&fit=crop&w=800&h=600",
      title: "Nutrition Guidance"
    },
    {
      url: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=800&h=600",
      title: "Functional Training"
    },
    {
      url: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=800&h=600",
      title: "HIIT Sessions"
    },
    {
      url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&h=600",
      title: "Recovery & Wellness"
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <CircularNav />
      
      <div className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Fitness <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e3bd30] to-[#f4d03f]">Gallery</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Explore our comprehensive fitness programs through our visual gallery. 
              From strength training to yoga, discover the variety of workouts that await you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {galleryImages.map((image, index) => (
              <Card key={index} className="group overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <CardContent className="p-0 relative">
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={image.url}
                      alt={image.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-white text-xl font-semibold">{image.title}</h3>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-16">
            <div className="bg-gradient-to-r from-[#e3bd30]/10 to-[#f4d03f]/10 border border-[#e3bd30]/20 rounded-2xl p-8 max-w-4xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Ready to Start Your Fitness Journey?
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Join thousands of members who have transformed their lives with Be In Shape. 
                Choose from our comprehensive training programs designed for all fitness levels.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/batches"
                  className="inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-[#e3bd30] to-[#f4d03f] hover:from-[#d4a82a] hover:to-[#e6c235] text-black font-semibold rounded-full transition-all"
                >
                  View Programs
                </a>
                <a
                  href="/auth"
                  className="inline-flex items-center justify-center px-8 py-3 border-2 border-[#e3bd30] text-[#e3bd30] hover:bg-[#e3bd30] hover:text-black font-semibold rounded-full transition-all"
                >
                  Join Today
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Gallery;

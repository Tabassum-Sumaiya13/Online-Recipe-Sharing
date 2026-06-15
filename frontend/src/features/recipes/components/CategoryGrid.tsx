import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";

const categoriesWithImages = [
  {
    name: "Breakfast",
    count: 86,
    image: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=400&auto=format&fit=crop",
  },
  {
    name: "Lunch",
    count: 124,
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop",
  },
  {
    name: "Dinner",
    count: 203,
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&auto=format&fit=crop",
  },
  {
    name: "Desserts",
    count: 97,
    image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&auto=format&fit=crop",
  },
  {
    name: "Healthy",
    count: 156,
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&auto=format&fit=crop",
  },
  {
    name: "Quick & Easy",
    count: 178,
    image: "https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=400&auto=format&fit=crop",
  },
];

const CategoryGrid = () => {
  const navigate = useNavigate();

  return (
    <section className="py-12 lg:py-20 bg-secondary/30">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header with View All button */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div className="text-center sm:text-left">
            <h2 className="text-2xl lg:text-4xl font-display font-bold text-foreground">
              Explore by Category
            </h2>
            <p className="text-sm lg:text-base text-muted-foreground mt-2">
              Find exactly what you're craving with our curated collections
            </p>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/categories")}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-border bg-background text-sm font-medium text-foreground hover:border-primary hover:bg-primary/5 transition-all shrink-0 self-center sm:self-auto"
          >
            View All Categories
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categoriesWithImages.map((cat, i) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -4 }}
              onClick={() => navigate(`/categories?category=${encodeURIComponent(cat.name)}`)}
              className="group relative rounded-card overflow-hidden cursor-pointer aspect-[3/4] shadow-card hover:shadow-card-hover transition-all"
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="font-display font-semibold text-base text-white">
                  {cat.name}
                </h3>
                <p className="text-xs text-white/80 tabular-nums font-medium mt-0.5">
                  {cat.count} recipes
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;
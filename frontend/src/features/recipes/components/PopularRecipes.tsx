import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePopularRecipes } from "@/features/recipes/api";
import { RecipeCard } from "@/components/shared/RecipeCard";
import { Skeleton } from "@/components/ui/skeleton";

const PopularRecipes = () => {
  const navigate = useNavigate();
  const { data: popularRecipes = [], isLoading } = usePopularRecipes();
  
  // Show only top 4
  const topRecipes = popularRecipes.slice(0, 4);

  return (
    <section className="py-12 lg:py-20">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header with View All button - same style as CategoryGrid */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl lg:text-4xl font-display font-bold text-foreground">
              Today's Top Recipes
            </h2>
            <p className="text-sm lg:text-base text-muted-foreground mt-2">
              The most loved recipes by our community right now
            </p>
          </div>
          
          <button
            onClick={() => navigate('/recipes')}
            className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-border bg-background text-sm font-medium text-foreground hover:border-primary hover:bg-primary/5 transition-all shrink-0 self-center sm:self-auto"
          >
            View All Recipes
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
             {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-card shadow-card bg-background overflow-hidden">
                <Skeleton className="aspect-[4/3] w-full" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {topRecipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        )}
        
        {/* Mobile View All Button - matching style */}
        <div className="mt-8 text-center sm:hidden">
          <button
            onClick={() => navigate('/recipes')}
            className="inline-flex items-center justify-center gap-2 w-full px-5 py-2.5 rounded-full border border-border bg-background text-sm font-medium text-foreground hover:border-primary hover:bg-primary/5 transition-all"
          >
            View All Recipes
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default PopularRecipes;

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, PlusCircle, Clock, Star, ChefHat } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useRecipes } from "@/hooks/useRecipes";
import { resolveRecipeImage } from "@/lib/recipe-images";
import { Skeleton } from "@/components/ui/skeleton";

const HeroSection = () => {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const { data: allRecipes = [] } = useRecipes();

  const heroRecipes = useMemo(() => allRecipes.slice(0, 7), [allRecipes]);
  const activeRecipe = heroRecipes[activeIndex] ?? null;

  const next = useCallback(() => {
    if (heroRecipes.length === 0) return;
    setActiveIndex((prev) => (prev + 1) % heroRecipes.length);
  }, [heroRecipes.length]);

  const prev = useCallback(() => {
    if (heroRecipes.length === 0) return;
    setActiveIndex((prev) => (prev - 1 + heroRecipes.length) % heroRecipes.length);
  }, [heroRecipes.length]);

  useEffect(() => {
    if (heroRecipes.length === 0) return;
    if (activeIndex >= heroRecipes.length) setActiveIndex(0);
  }, [heroRecipes.length, activeIndex]);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  const orbitPositions = useMemo(() => {
    const count = heroRecipes.length || 1;
    const arcStart = -Math.PI * 0.85;
    const arcEnd = -Math.PI * 0.15;
    return heroRecipes.map((_, i) => {
      const t = count === 1 ? 0.5 : i / (count - 1);
      const angle = arcStart + (arcEnd - arcStart) * t;
      const rx = 300, ry = 170, cx = 50, cy = 55;
      return { x: cx + rx * Math.cos(angle), y: cy + ry * Math.sin(angle) };
    });
  }, [heroRecipes.length]);

  const arcPath = useMemo(() => {
    const rx = 300, ry = 170, cx = 50, cy = 55;
    const startAngle = -Math.PI * 0.85;
    const endAngle = -Math.PI * 0.15;
    const steps = 60;
    const points: string[] = [];
    for (let i = 0; i <= steps; i++) {
      const angle = startAngle + (endAngle - startAngle) * (i / steps);
      points.push(`${i === 0 ? "M" : "L"} ${cx + rx * Math.cos(angle)} ${cy + ry * Math.sin(angle)}`);
    }
    return points.join(" ");
  }, []);

  if (heroRecipes.length === 0 || !activeRecipe) {
    return (
      <section className="relative pt-4 pb-8 lg:pb-16">
        <div className="container mx-auto px-4 lg:px-8">
          <Skeleton className="h-[400px] w-full rounded-2xl" />
        </div>
      </section>
    );
  }

  return (
    <section className="relative pt-24 pb-8 lg:pb-16">
      {/* Background blobs — overflow clipped here so the section itself doesn't clip tooltip children */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/3 w-[700px] h-[700px] lg:w-[1000px] lg:h-[900px] rounded-full bg-secondary/60 blur-3xl" />
        <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] rounded-full bg-primary/5 blur-2xl" />
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-4 items-center min-h-[520px]">

          {/* Left — text content */}
          <div className="lg:col-span-5 space-y-6 z-10">
            <p className="text-sm font-medium text-primary uppercase tracking-wider">
              Dish of the Day
            </p>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeRecipe.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.4 }}
                className="space-y-3"
              >
                <h1 className="text-3xl lg:text-5xl font-display font-bold text-foreground leading-tight">
                  {activeRecipe.title}
                </h1>
                <p className="text-muted-foreground text-base lg:text-lg max-w-sm">
                  {activeRecipe.description}
                </p>
              </motion.div>
            </AnimatePresence>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(`/recipes/${activeRecipe.id}`)}
                className="h-12 px-8 bg-primary text-primary-foreground font-semibold rounded-full hover:opacity-90 transition-opacity text-sm"
              >
                Explore Recipe
              </button>
              <button
                onClick={() => navigate("/post-recipe")}
                className="h-12 px-6 border border-border bg-background text-foreground font-semibold rounded-full hover:border-primary transition-colors text-sm flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4" /> Post a recipe
              </button>
            </div>
          </div>

          {/* Right — arc carousel */}
          <div className="lg:col-span-7 relative flex flex-col items-center">
            <div className="relative w-full" style={{ paddingBottom: "85%" }}>

              {/* Arc guide line + decorative dots */}
              <svg
                viewBox="-300 -170 700 400"
                className="absolute inset-0 w-full h-full pointer-events-none"
                preserveAspectRatio="xMidYMid meet"
              >
                {/* Outer glow track */}
                {/* <path
                  d={arcPath}
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="6"
                  opacity="0.06"
                /> */}
                {/* Main dashed track */}
                <path
                  d={arcPath}
                  fill="none"
                  stroke="hsl(var(--border))"
                  strokeWidth="1.5"
                  strokeDasharray="5 8"
                  opacity="0.55"
                />
                {/* Static sparkle dots scattered near the arc */}
                {[{cx:-228,cy:-108,r:2.5},{cx:-80,cy:-160,r:2},{cx:80,cy:-155,r:3},{cx:230,cy:-95,r:2.5},{cx:320,cy:-10,r:2},{cx:-310,cy:10,r:2}].map((d,i)=>(
                  <motion.circle
                    key={i}
                    cx={d.cx} cy={d.cy} r={d.r}
                    fill="hsl(var(--primary))"
                    initial={{ opacity: 0.15, scale: 1 }}
                    animate={{ opacity: [0.15, 0.55, 0.15], scale: [1, 1.4, 1] }}
                    transition={{ duration: 2.4 + i * 0.5, repeat: Infinity, delay: i * 0.35, ease: "easeInOut" }}
                  />
                ))}
              </svg>

              {/* All orbit thumbnails — active stays visible with ring highlight */}
              {heroRecipes.map((recipe, i) => {
                const isActive = i === activeIndex;
                const pos = orbitPositions[i];
                const leftPct = (pos.x + 300) / 700 * 100;
                const topPct = (pos.y + 170) / 400 * 100;
                return (
                  <motion.button
                    key={recipe.id}
                    onClick={() => setActiveIndex(i)}
                    className="absolute group cursor-pointer focus-visible:outline-none"
                    style={{ left: `${leftPct}%`, top: `${topPct}%` }}
                    initial={false}
                    animate={{
                      width: isActive ? 88 : 62,
                      height: isActive ? 88 : 62,
                      x: "-50%",
                      y: "-50%",
                      opacity: isActive ? 1 : 0.6,
                      zIndex: isActive ? 15 : 10,
                    }}
                    whileHover={{ scale: 1.2, opacity: 1, zIndex: 20 }}
                    transition={{ type: "spring", stiffness: 260, damping: 24 }}
                  >
                    {/* Thumbnail image */}
                    <div
                      className={`w-full h-full rounded-full overflow-hidden transition-all duration-200 ${
                        isActive
                          ? "ring-[3px] ring-primary shadow-[0_0_0_6px_hsl(var(--primary)/0.18)]"
                          : "ring-1 ring-border/70 group-hover:ring-primary/50"
                      }`}
                    >
                      <img
                        src={resolveRecipeImage(recipe.imageUrl)}
                        alt={recipe.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {/* Name tooltip — appears above thumbnail on hover */}
                    <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap bg-popover border border-border text-popover-foreground text-[11px] font-medium px-2.5 py-1 rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-30 max-w-[140px] truncate">
                      {recipe.title}
                    </span>
                  </motion.button>
                );
              })}

              {/* Large centered active image + floating badges */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeRecipe.id}
                  className="absolute z-20"
                  style={{ left: "50%", top: "62%" }}
                  initial={{ scale: 0.85, opacity: 0, x: "-50%", y: "-50%" }}
                  animate={{ scale: 1, opacity: 1, x: "-50%", y: "-50%" }}
                  exit={{ scale: 0.85, opacity: 0, x: "-50%", y: "-50%" }}
                  transition={{ type: "spring", stiffness: 160, damping: 20 }}
                >
                  {/* Pulsing glow ring behind image */}
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    animate={{ scale: [1, 1.08, 1], opacity: [0.35, 0.08, 0.35] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    style={{ background: "radial-gradient(circle, hsl(var(--primary)/0.4) 0%, transparent 70%)" }}
                  />

                  <div className="relative w-[280px] h-[280px] lg:w-[310px] lg:h-[310px] rounded-full overflow-hidden ring-4 ring-primary/25 shadow-2xl">
                    <img
                      src={resolveRecipeImage(activeRecipe.imageUrl)}
                      alt={activeRecipe.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Badge — Prep Time (top-left) */}
                  <motion.div
                    initial={{ opacity: 0, x: -12, y: 8 }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    transition={{ delay: 0.25, type: "spring", stiffness: 220, damping: 18 }}
                    className="absolute -top-3 -left-10 bg-card/90 backdrop-blur-sm border border-border rounded-2xl px-3 py-2 shadow-lg flex items-center gap-2 min-w-[100px]"
                  >
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Clock className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground leading-none">Prep Time</p>
                      <p className="text-xs font-semibold text-foreground mt-0.5">{activeRecipe.prepTime}</p>
                    </div>
                  </motion.div>

                  {/* Badge — Rating (top-right) */}
                  <motion.div
                    initial={{ opacity: 0, x: 12, y: 8 }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    exit={{ opacity: 0, x: 12 }}
                    transition={{ delay: 0.35, type: "spring", stiffness: 220, damping: 18 }}
                    className="absolute -top-3 -right-10 bg-card/90 backdrop-blur-sm border border-border rounded-2xl px-3 py-2 shadow-lg flex items-center gap-2 min-w-[90px]"
                  >
                    <div className="w-7 h-7 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
                      <Star className="w-3.5 h-3.5 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground leading-none">Rating</p>
                      <p className="text-xs font-semibold text-foreground mt-0.5">{Number(activeRecipe.rating).toFixed(1)}</p>
                    </div>
                  </motion.div>

                  {/* Badge — Difficulty (bottom-right) */}
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 12 }}
                    transition={{ delay: 0.45, type: "spring", stiffness: 220, damping: 18 }}
                    className="absolute bottom-2 -right-12 bg-card/90 backdrop-blur-sm border border-border rounded-2xl px-3 py-2 shadow-lg flex items-center gap-2 min-w-[100px]"
                  >
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <ChefHat className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground leading-none">Difficulty</p>
                      <p className="text-xs font-semibold text-foreground mt-0.5">{activeRecipe.difficulty}</p>
                    </div>
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Prev / counter / Next */}
            <div className="flex items-center -mt-8 z-30 gap-[113px]">
              <motion.button
                onClick={prev}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 rounded-full border border-border bg-background flex items-center justify-center text-foreground hover:border-primary transition-colors shadow-sm"
              >
                <ChevronLeft className="w-5 h-5" />
              </motion.button>
              <span className="text-xs text-muted-foreground tabular-nums">
                {activeIndex + 1} / {heroRecipes.length}
              </span>
              <motion.button
                onClick={next}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 rounded-full border border-border bg-background flex items-center justify-center text-foreground hover:border-primary transition-colors shadow-sm"
              >
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default HeroSection;

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Zap,
  Shield,
  Sparkles,
  MessageSquare,
  Users,
  Bot,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface LandingPageProps {
  onEnterApp: () => void;
  onOpenNitro?: () => void;
}

const LandingPage = ({ onEnterApp, onOpenNitro }: LandingPageProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden relative">
      {/* Animated Background */}
      <div className="fixed inset-0 hex-pattern opacity-30 md:opacity-50" />
      <div className="fixed inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent" />

      {/* Floating Orbs - Optimized sizes for mobile */}
      <motion.div
        animate={{
          y: [0, -20, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="fixed top-1/4 -left-20 md:left-1/4 w-60 h-60 md:w-96 md:h-96 bg-primary/10 rounded-full blur-3xl opacity-50"
      />
      <motion.div
        animate={{
          y: [0, 20, 0],
          scale: [1, 0.9, 1],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="fixed bottom-1/4 -right-20 md:right-1/4 w-40 h-40 md:w-80 md:h-80 bg-accent/10 rounded-full blur-3xl opacity-50"
      />

      {/* Navigation */}
      <nav className="relative z-50 flex items-center justify-between px-4 sm:px-8 py-4 bg-background/50 backdrop-blur-lg lg:bg-transparent">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 sm:gap-3"
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-primary flex items-center justify-center text-lg sm:text-xl glow">
            🦊
          </div>
          <span className="font-display text-xl sm:text-2xl text-foreground tracking-wider">
            NOTFOX
          </span>
        </motion.div>

        {/* Desktop Menu */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden lg:flex items-center gap-4"
        >
          <Button
            variant="ghost"
            className="text-muted-foreground hover:text-foreground"
          >
            Features
          </Button>
          <Button
            variant="ghost"
            className="text-muted-foreground hover:text-foreground"
          >
            Nitro
          </Button>
          <Button
            variant="ghost"
            className="text-muted-foreground hover:text-foreground"
          >
            Developers
          </Button>
          <Button
            variant="outline"
            className="border-primary/50"
            onClick={onEnterApp}
          >
            Log In
          </Button>
          <Button variant="glow" onClick={onEnterApp}>
            Open App
          </Button>
        </motion.div>

        {/* Mobile Toggle */}
        <button
          className="lg:hidden p-2 text-foreground"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-full left-0 right-0 bg-background/95 backdrop-blur-xl border-b border-border p-4 flex flex-col gap-4 lg:hidden shadow-2xl"
            >
              <Button variant="ghost" className="justify-start">
                Features
              </Button>
              <Button variant="ghost" className="justify-start">
                Nitro
              </Button>
              <Button variant="ghost" className="justify-start">
                Developers
              </Button>
              <hr className="border-border" />
              <Button variant="outline" className="w-full" onClick={onEnterApp}>
                Log In
              </Button>
              <Button variant="glow" className="w-full" onClick={onEnterApp}>
                Open App
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-[90vh] sm:min-h-[85vh] px-4 sm:px-8 text-center py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-4xl"
        >
          <div className="flex items-center justify-center gap-2 mb-4 sm:mb-6">
            <div className="px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs sm:text-sm font-medium">
              <Sparkles className="inline w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              Blue Lock Edition
            </div>
          </div>

          <h1 className="font-display text-5xl sm:text-7xl md:text-8xl lg:text-9xl text-foreground mb-4 sm:mb-6 tracking-wider leading-none">
            NOTFOX
            <span className="block gradient-text text-glow">DEVELOPMENT</span>
          </h1>

          <p className="text-base sm:text-lg md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed px-4">
            The ultimate platform for developers, creators, and teams.
            <br className="hidden sm:block" />
            <span className="text-foreground font-medium">
              Built different. Designed to dominate.
            </span>
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 px-8 w-full">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onHoverStart={() => setIsHovered(true)}
              onHoverEnd={() => setIsHovered(false)}
              className="w-full sm:w-auto"
            >
              <Button
                variant="hero"
                size="xl"
                onClick={onEnterApp}
                className="group w-full"
              >
                Enter the Arena
                <motion.span
                  animate={{ x: isHovered ? 5 : 0 }}
                  transition={{ type: "spring", stiffness: 400 }}
                  className="ml-2"
                >
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </motion.span>
              </Button>
            </motion.div>
            <Button variant="glass" size="xl" className="w-full sm:w-auto">
              Watch Demo
            </Button>
          </div>
        </motion.div>

        {/* Scroll Indicator - Hidden on very small screens */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-4 sm:bottom-8 hidden xs:flex flex-col items-center"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex flex-col items-center text-muted-foreground"
          >
            <span className="text-xs sm:text-sm mb-2">Scroll to explore</span>
            <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-16 sm:py-24 px-4 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-6xl mx-auto"
        >
          <h2 className="font-display text-4xl sm:text-5xl text-center text-foreground mb-4 tracking-wider leading-tight">
            FEATURES THAT <span className="gradient-text">DOMINATE</span>
          </h2>
          <p className="text-center text-muted-foreground mb-12 sm:mb-16 max-w-xl mx-auto px-4">
            Everything you need to communicate, collaborate, and conquer.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="glass-hover p-6 rounded-xl group cursor-pointer"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 py-16 sm:py-24 px-4 sm:px-8 border-y border-border bg-card/20">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 text-center">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="font-display text-4xl sm:text-5xl gradient-text mb-2 tracking-tight">
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground uppercase tracking-widest">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20 sm:py-32 px-4 sm:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <h2 className="font-display text-4xl sm:text-5xl text-foreground mb-4 sm:mb-6 tracking-wider leading-tight">
            READY TO <span className="gradient-text">LEVEL UP</span>?
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground mb-8 sm:mb-10 px-4">
            Join thousands of developers who have already made the switch.
          </p>
          <div className="flex justify-center px-4">
            <Button
              variant="hero"
              size="xl"
              onClick={onEnterApp}
              className="w-full sm:w-auto"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border py-8 sm:py-12 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="text-xl sm:text-2xl">🦊</span>
            <span className="font-display text-lg sm:text-xl text-foreground tracking-widest">
              NOTFOX
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-right">
            © {new Date().getFullYear()} NotFox Development. All rights
            reserved.
            <br className="sm:hidden" />
            <span className="hidden sm:inline"> | </span>
            Designed to Dominate.
          </p>
        </div>
      </footer>
    </div>
  );
};

const features = [
  {
    icon: MessageSquare,
    title: "Real-Time Chat",
    description:
      "Lightning-fast messaging with typing indicators, reactions, and rich media support.",
  },
  {
    icon: Users,
    title: "Team Servers",
    description:
      "Create communities with channels, roles, and permissions tailored to your needs.",
  },
  {
    icon: Bot,
    title: "AI Integration",
    description:
      "Built-in AI assistant for coding help, moderation, and smart automation.",
  },
  {
    icon: Zap,
    title: "Blazing Fast",
    description:
      "60fps animations and instant updates. No lag, no delay, just speed.",
  },
  {
    icon: Shield,
    title: "Secure by Design",
    description: "End-to-end encryption, 2FA, and advanced moderation tools.",
  },
  {
    icon: Sparkles,
    title: "Premium Features",
    description:
      "Unlock animated avatars, custom themes, and exclusive perks with Nitro.",
  },
];

const stats = [
  { value: "10M+", label: "Active Users" },
  { value: "500K+", label: "Servers" },
  { value: "99.9%", label: "Uptime" },
  { value: "24/7", label: "Support" },
];

export default LandingPage;

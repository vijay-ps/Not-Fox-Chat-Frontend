import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, Shield, Sparkles, MessageSquare, Users, Bot, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LandingPageProps {
  onEnterApp: () => void;
  onOpenNitro?: () => void;
}

const LandingPage = ({ onEnterApp, onOpenNitro }: LandingPageProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="min-h-screen bg-background overflow-hidden relative">
      {/* Animated Background */}
      <div className="fixed inset-0 hex-pattern opacity-50" />
      <div className="fixed inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent" />
      
      {/* Floating Orbs */}
      <motion.div
        animate={{
          y: [0, -20, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="fixed top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          y: [0, 20, 0],
          scale: [1, 0.9, 1],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="fixed bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl"
      />

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-xl glow">
            🦊
          </div>
          <span className="font-display text-2xl text-foreground tracking-wider">NOTFOX</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4"
        >
          <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
            Features
          </Button>
          <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
            Nitro
          </Button>
          <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
            Developers
          </Button>
          <Button variant="outline" className="border-primary/50">
            Log In
          </Button>
          <Button variant="glow" onClick={onEnterApp}>
            Open App
          </Button>
        </motion.div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-[85vh] px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm font-medium">
              <Sparkles className="inline w-4 h-4 mr-1" />
              Blue Lock Edition
            </div>
          </div>

          <h1 className="font-display text-7xl md:text-9xl text-foreground mb-6 tracking-wider">
            NOTFOX
            <span className="block gradient-text text-glow">DEVELOPMENT</span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            The ultimate platform for developers, creators, and teams.
            <br />
            <span className="text-foreground font-medium">Built different. Designed to dominate.</span>
          </p>

          <div className="flex items-center justify-center gap-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onHoverStart={() => setIsHovered(true)}
              onHoverEnd={() => setIsHovered(false)}
            >
              <Button 
                variant="hero" 
                size="xl" 
                onClick={onEnterApp}
                className="group"
              >
                Enter the Arena
                <motion.span
                  animate={{ x: isHovered ? 5 : 0 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                >
                  <ArrowRight className="w-5 h-5" />
                </motion.span>
              </Button>
            </motion.div>
            <Button variant="glass" size="xl">
              Watch Demo
            </Button>
          </div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex flex-col items-center text-muted-foreground"
          >
            <span className="text-sm mb-2">Scroll to explore</span>
            <ChevronDown className="w-5 h-5" />
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-24 px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-6xl mx-auto"
        >
          <h2 className="font-display text-5xl text-center text-foreground mb-4 tracking-wider">
            FEATURES THAT <span className="gradient-text">DOMINATE</span>
          </h2>
          <p className="text-center text-muted-foreground mb-16 max-w-xl mx-auto">
            Everything you need to communicate, collaborate, and conquer.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 py-24 px-8 border-y border-border bg-card/20">
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-8 text-center">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="font-display text-5xl gradient-text mb-2">{stat.value}</div>
              <div className="text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-32 px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <h2 className="font-display text-5xl text-foreground mb-6 tracking-wider">
            READY TO <span className="gradient-text">LEVEL UP</span>?
          </h2>
          <p className="text-xl text-muted-foreground mb-10">
            Join thousands of developers who have already made the switch.
          </p>
          <Button variant="hero" size="xl" onClick={onEnterApp}>
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </Button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border py-8 px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🦊</span>
            <span className="font-display text-lg text-foreground">NOTFOX</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 NotFox Development. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

const features = [
  {
    icon: MessageSquare,
    title: 'Real-Time Chat',
    description: 'Lightning-fast messaging with typing indicators, reactions, and rich media support.',
  },
  {
    icon: Users,
    title: 'Team Servers',
    description: 'Create communities with channels, roles, and permissions tailored to your needs.',
  },
  {
    icon: Bot,
    title: 'AI Integration',
    description: 'Built-in AI assistant for coding help, moderation, and smart automation.',
  },
  {
    icon: Zap,
    title: 'Blazing Fast',
    description: '60fps animations and instant updates. No lag, no delay, just speed.',
  },
  {
    icon: Shield,
    title: 'Secure by Design',
    description: 'End-to-end encryption, 2FA, and advanced moderation tools.',
  },
  {
    icon: Sparkles,
    title: 'Premium Features',
    description: 'Unlock animated avatars, custom themes, and exclusive perks with Nitro.',
  },
];

const stats = [
  { value: '10M+', label: 'Active Users' },
  { value: '500K+', label: 'Servers' },
  { value: '99.9%', label: 'Uptime' },
  { value: '24/7', label: 'Support' },
];

export default LandingPage;

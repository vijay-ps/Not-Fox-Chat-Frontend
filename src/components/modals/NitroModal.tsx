import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Crown, Zap, Palette, Upload, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NitroModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NitroModal = ({ isOpen, onClose }: NitroModalProps) => {
  if (!isOpen) return null;

  const features = [
    { icon: Sparkles, title: 'Animated Avatar', desc: 'Stand out with animated profile pictures' },
    { icon: Palette, title: 'Custom Themes', desc: 'Personalize your NotFox experience' },
    { icon: Upload, title: 'Larger Uploads', desc: 'Upload files up to 100MB' },
    { icon: Crown, title: 'Server Boosts', desc: 'Boost your favorite servers' },
    { icon: Bot, title: 'AI Priority', desc: 'Faster AI responses with priority access' },
    { icon: Zap, title: 'Early Access', desc: 'Be first to try new features' },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="w-full max-w-lg glass rounded-2xl p-6 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-primary to-accent flex items-center justify-center">
                <Crown className="w-5 h-5 text-primary-foreground" />
              </div>
              <h2 className="text-xl font-display gradient-text">NOTFOX NITRO</h2>
            </div>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-muted-foreground mb-6">
            Unlock premium features and support NotFox Development.
          </p>

          <div className="grid grid-cols-2 gap-3 mb-6">
            {features.map((feature) => (
              <div key={feature.title} className="p-3 rounded-lg bg-secondary/50 border border-border">
                <feature.icon className="w-5 h-5 text-primary mb-2" />
                <h3 className="font-medium text-foreground text-sm">{feature.title}</h3>
                <p className="text-xs text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <Button variant="hero" className="flex-1">
              $9.99/month
            </Button>
            <Button variant="glass" className="flex-1">
              $99.99/year
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center mt-4">
            Coming soon! Join the waitlist.
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default NitroModal;

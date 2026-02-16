import { SiFacebook, SiX, SiInstagram, SiTelegram } from 'react-icons/si';
import { Separator } from '@/components/ui/separator';
import { Heart } from 'lucide-react';

export default function SiteFooter() {
  const currentYear = new Date().getFullYear();
  const appIdentifier = encodeURIComponent(
    typeof window !== 'undefined' ? window.location.hostname : 'a7j-topup'
  );

  return (
    <footer className="bg-muted/30 border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Stay Connected */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-primary">Stay Connected</h3>
            <div className="flex gap-4">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <SiFacebook className="w-5 h-5 text-primary" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors"
                aria-label="X (Twitter)"
              >
                <SiX className="w-5 h-5 text-primary" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <SiInstagram className="w-5 h-5 text-primary" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors"
                aria-label="Telegram"
              >
                <SiTelegram className="w-5 h-5 text-primary" />
              </a>
            </div>
          </div>

          {/* Download App */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-primary">Download App</h3>
            <a href="#" className="inline-block">
              <img
                src="/assets/generated/google-play-badge.dim_512x160.png"
                alt="Get it on Google Play"
                className="h-12"
              />
            </a>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-primary">Support</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Telegram Support</p>
              <p className="font-semibold text-foreground">9:00 AM - 12:00 PM</p>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="text-center text-sm text-muted-foreground">
          <p>
            © {currentYear} A7J TOPUP. All rights reserved.
          </p>
          <p className="mt-2">
            Built with <Heart className="inline w-4 h-4 text-primary fill-primary" /> using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appIdentifier}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, MessageCircle } from 'lucide-react';

export default function ContactUsPage() {
  return (
    <div className="min-h-screen py-12 bg-white">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold text-gradient-purple mb-8 text-center">Contact Us</h1>
        <p className="text-center text-muted-foreground mb-12">
          We're here to help! Reach out to us through any of the following channels.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Telegram Support */}
          <Card className="border-primary/30 shadow-soft bg-white">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-primary" />
                </div>
              </div>
              <CardTitle className="text-primary">Telegram Support</CardTitle>
              <CardDescription>Chat with our support team</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Available Hours:</p>
                <p className="text-lg font-semibold text-foreground">9:00 AM - 12:00 PM</p>
                <p className="text-sm text-muted-foreground mt-4">
                  Join our Telegram channel for instant support and updates.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Email Support */}
          <Card className="border-primary/30 shadow-soft bg-white">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
              </div>
              <CardTitle className="text-primary">Email Support</CardTitle>
              <CardDescription>Send us an email</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Email Address:</p>
                <p className="text-lg font-semibold text-primary">support@a7jtopup.com</p>
                <p className="text-sm text-muted-foreground mt-4">
                  We typically respond within 24 hours during business days.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

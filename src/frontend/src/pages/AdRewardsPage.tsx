import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tv, Coins, Loader2, Gift } from 'lucide-react';
import { useGetCallerPointsBalance, useGetCallerDailyAdCount, useClaimAdReward } from '../hooks/usePoints';
import { generateTransactionId } from '../utils/transactionId';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';
import { Progress } from '@/components/ui/progress';

const DAILY_AD_LIMIT = 10;

export default function AdRewardsPage() {
  const { data: pointsBalance = BigInt(0) } = useGetCallerPointsBalance();
  const { data: dailyAdCount = BigInt(0) } = useGetCallerDailyAdCount();
  const claimReward = useClaimAdReward();

  const handleWatchAd = async () => {
    try {
      const transactionId = generateTransactionId();
      await claimReward.mutateAsync(transactionId);
      toast.success('1 point earned.');
    } catch (error: any) {
      let errorMessage = 'Failed to claim reward';
      if (error.message) {
        if (error.message.includes('Daily ad limit reached')) {
          errorMessage = 'Daily ad limit reached. Come back tomorrow.';
        } else {
          errorMessage = error.message;
        }
      }
      toast.error(errorMessage);
    }
  };

  const adsWatched = Number(dailyAdCount);
  const adsRemaining = Math.max(0, DAILY_AD_LIMIT - adsWatched);
  const progressPercentage = (adsWatched / DAILY_AD_LIMIT) * 100;

  return (
    <div className="container mx-auto px-4 py-12 bg-white min-h-screen">
      <Toaster />
      
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Gift className="w-10 h-10 text-primary" />
          <h1 className="text-4xl font-bold text-gradient-purple">Ad Rewards</h1>
        </div>

        {/* Points Balance */}
        <Card className="bg-primary shadow-soft border-primary mb-8">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-white" />
              <CardTitle className="text-lg text-white">Your Points Balance</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-white">{pointsBalance.toString()} Points</p>
          </CardContent>
        </Card>

        {/* Daily Progress */}
        <Card className="bg-white shadow-soft border-primary/30 mb-8">
          <CardHeader>
            <CardTitle>Daily Progress</CardTitle>
            <CardDescription>Watch ads to earn points (Max {DAILY_AD_LIMIT} per day)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Ads Watched Today</span>
                <span className="font-semibold text-primary">{adsWatched} / {DAILY_AD_LIMIT}</span>
              </div>
              <Progress value={progressPercentage} className="h-3" />
            </div>
            
            <div className="bg-purple-50 border border-primary/30 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">Ads Remaining Today:</p>
              <p className="text-2xl font-bold text-primary">{adsRemaining}</p>
            </div>
          </CardContent>
        </Card>

        {/* Watch Ad Card */}
        <Card className="bg-gradient-to-br from-purple-50 to-white shadow-soft border-primary/30">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-primary/10 p-6 rounded-full">
                <Tv className="w-16 h-16 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl">Watch Ad & Earn Points</CardTitle>
            <CardDescription className="text-base">
              Earn +1 point for each ad you watch
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleWatchAd}
              disabled={claimReward.isPending || adsRemaining === 0}
              className="w-full btn-purple-gradient text-lg py-6"
            >
              {claimReward.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : adsRemaining === 0 ? (
                'Daily Limit Reached'
              ) : (
                <>
                  <Tv className="w-5 h-5 mr-2" />
                  Watch Ad (+1 Point)
                </>
              )}
            </Button>

            {adsRemaining === 0 && (
              <p className="text-center text-sm text-muted-foreground mt-4">
                Come back tomorrow for more rewards
              </p>
            )}
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-white shadow-soft border-primary/30 mt-8">
          <CardHeader>
            <CardTitle className="text-lg">How It Works</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>Watch ads to earn +1 point per ad</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>Maximum {DAILY_AD_LIMIT} ads per day</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>Points are added instantly to your balance</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>Use points to purchase diamonds or game packages</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

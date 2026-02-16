import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Wallet, ShoppingBag, History, Coins, Plus, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGetCallerBalance, useGetCallerTransactions } from '../hooks/useWallet';
import { useGetCallerOrders } from '../hooks/useOrders';
import { useGetCallerUserProfile, useSaveCallerUserProfile } from '../hooks/useQueries';
import { useGetCallerPointsBalance, useGetCallerPointsTransactions } from '../hooks/usePoints';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { data: balance = BigInt(0) } = useGetCallerBalance();
  const { data: pointsBalance = BigInt(0) } = useGetCallerPointsBalance();
  const { data: transactions = [] } = useGetCallerTransactions();
  const { data: pointsTransactions = [] } = useGetCallerPointsTransactions();
  const { data: orders = [] } = useGetCallerOrders();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const saveProfile = useSaveCallerUserProfile();

  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    if (isFetched && userProfile === null) {
      setShowProfileSetup(true);
    }
  }, [userProfile, isFetched]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveProfile.mutateAsync(profileData);
      setShowProfileSetup(false);
    } catch (error) {
      console.error('Failed to save profile:', error);
    }
  };

  const getOrderStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return <Badge className="bg-green-500 text-white">Delivered</Badge>;
      case 'processing':
        return <Badge className="bg-blue-500 text-white">Processing</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const getTransactionStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500 text-white">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const getPointsTransactionTypeBadge = (type: string) => {
    switch (type) {
      case 'purchase':
        return <Badge className="bg-green-500 text-white">Purchase</Badge>;
      case 'spend':
        return <Badge className="bg-blue-500 text-white">Spend</Badge>;
      case 'adReward':
        return <Badge className="bg-purple-500 text-white">Ad Reward</Badge>;
      case 'adminAdjustment':
        return <Badge variant="secondary">Admin</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  if (profileLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 bg-white">
      <Dialog open={showProfileSetup} onOpenChange={setShowProfileSetup}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Complete Your Profile</DialogTitle>
            <DialogDescription>
              Please provide your details to continue using A7J TOPUP
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                required
              />
            </div>
            <Button
              type="submit"
              disabled={saveProfile.isPending}
              className="w-full btn-purple-gradient"
            >
              {saveProfile.isPending ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : null}
              Save Profile
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <h1 className="text-4xl font-bold text-gradient-purple mb-8">Dashboard</h1>

      {/* Balance Cards */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card className="bg-primary shadow-soft border-primary/30">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Wallet className="w-6 h-6 text-white" />
              <CardTitle className="text-white">Wallet Balance</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-white mb-4">৳{balance.toString()}</p>
            <Button
              onClick={() => navigate({ to: '/add-money' })}
              className="bg-white text-primary hover:bg-white/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Money
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-600 to-purple-700 shadow-soft border-purple-600">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Coins className="w-6 h-6 text-white" />
              <CardTitle className="text-white">Points Balance</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-white mb-4">{pointsBalance.toString()} Points</p>
            <Button
              onClick={() => navigate({ to: '/buy-points' })}
              className="bg-white text-purple-600 hover:bg-white/90"
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              Buy Points
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Button
          onClick={() => navigate({ to: '/add-money' })}
          variant="outline"
          className="h-auto py-4 flex-col gap-2 border-primary/30 hover:bg-primary/5"
        >
          <Wallet className="w-6 h-6 text-primary" />
          <span className="text-sm">Add Money</span>
        </Button>
        <Button
          onClick={() => navigate({ to: '/buy-points' })}
          variant="outline"
          className="h-auto py-4 flex-col gap-2 border-primary/30 hover:bg-primary/5"
        >
          <Coins className="w-6 h-6 text-primary" />
          <span className="text-sm">Buy Points</span>
        </Button>
        <Button
          onClick={() => navigate({ to: '/buy-diamonds' })}
          variant="outline"
          className="h-auto py-4 flex-col gap-2 border-primary/30 hover:bg-primary/5"
        >
          <ShoppingBag className="w-6 h-6 text-primary" />
          <span className="text-sm">Buy Diamonds</span>
        </Button>
        <Button
          onClick={() => navigate({ to: '/ad-rewards' })}
          variant="outline"
          className="h-auto py-4 flex-col gap-2 border-primary/30 hover:bg-primary/5"
        >
          <History className="w-6 h-6 text-primary" />
          <span className="text-sm">Ad Rewards</span>
        </Button>
      </div>

      {/* Tabs for Orders, Transactions, and Points */}
      <Tabs defaultValue="orders" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 bg-muted/30">
          <TabsTrigger value="orders">
            <ShoppingBag className="w-4 h-4 mr-2" />
            Orders
          </TabsTrigger>
          <TabsTrigger value="transactions">
            <History className="w-4 h-4 mr-2" />
            Wallet
          </TabsTrigger>
          <TabsTrigger value="points">
            <Coins className="w-4 h-4 mr-2" />
            Points
          </TabsTrigger>
        </TabsList>

        <TabsContent value="orders">
          <Card className="border-primary/30 shadow-soft bg-white">
            <CardHeader>
              <CardTitle>Order History</CardTitle>
              <CardDescription>View your recent top-up orders</CardDescription>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No orders yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Product ID</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Auto Delivery</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell>#{order.id}</TableCell>
                          <TableCell>{order.productId}</TableCell>
                          <TableCell>৳{order.amount.toString()}</TableCell>
                          <TableCell>{getOrderStatusBadge(order.status)}</TableCell>
                          <TableCell>
                            {order.isAutoDelivery ? (
                              <Badge variant="secondary" className="bg-primary/20 text-primary">
                                Yes
                              </Badge>
                            ) : (
                              <Badge variant="outline">No</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
          <Card className="border-primary/30 shadow-soft bg-white">
            <CardHeader>
              <CardTitle>Wallet Transaction History</CardTitle>
              <CardDescription>View your wallet top-up requests</CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No transactions yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Transaction ID</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((tx) => (
                        <TableRow key={tx.id}>
                          <TableCell className="font-mono text-sm">{tx.transactionId}</TableCell>
                          <TableCell className="capitalize">{tx.paymentMethod}</TableCell>
                          <TableCell>৳{tx.amount.toString()}</TableCell>
                          <TableCell>{getTransactionStatusBadge(tx.status)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="points">
          <Card className="border-primary/30 shadow-soft bg-white">
            <CardHeader>
              <CardTitle>Points Transaction History</CardTitle>
              <CardDescription>View your points activity</CardDescription>
            </CardHeader>
            <CardContent>
              {pointsTransactions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No points transactions yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pointsTransactions.map((tx) => (
                        <TableRow key={tx.id}>
                          <TableCell>{getPointsTransactionTypeBadge(tx.transactionType)}</TableCell>
                          <TableCell>
                            <span className={tx.amount >= 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                              {tx.amount >= 0 ? '+' : ''}{tx.amount.toString()}
                            </span>
                          </TableCell>
                          <TableCell className="max-w-xs truncate">{tx.metadata}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(Number(tx.createdAt) / 1000000).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

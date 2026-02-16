import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Users, ShoppingBag, Wallet, Check, X, Coins, Gem, Tv, Settings, TrendingUp, Loader2 } from 'lucide-react';
import {
  useGetAllTransactions,
  useApproveTransaction,
  useRejectTransaction,
} from '../../hooks/useAdmin';
import { useGetAllOrders } from '../../hooks/useOrders';
import { useGetUsers } from '../../hooks/useQueries';
import {
  useGetAllPointsTransactions,
  useGetAllPointsPurchaseRequests,
  useApprovePointsPurchaseRequest,
  useRejectPointsPurchaseRequest,
  useGetAllDiamondPurchases,
  useGetAdRewardsAnalytics,
  useGetAdminDashboard,
  useUpdateConversionSettings,
} from '../../hooks/useAdminPoints';
import { useGetConversionSettings } from '../../hooks/usePoints';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';
import { useState } from 'react';

export default function AdminPanelPage() {
  const { data: transactions = [] } = useGetAllTransactions();
  const { data: orders = [] } = useGetAllOrders();
  const { data: users = [] } = useGetUsers();
  const { data: pointsTransactions = [] } = useGetAllPointsTransactions();
  const { data: pointsPurchaseRequests = [] } = useGetAllPointsPurchaseRequests();
  const { data: diamondPurchases = [] } = useGetAllDiamondPurchases();
  const { data: adAnalytics } = useGetAdRewardsAnalytics();
  const { data: dashboard } = useGetAdminDashboard();
  const { data: settings } = useGetConversionSettings();
  const approveTransaction = useApproveTransaction();
  const rejectTransaction = useRejectTransaction();
  const approvePointsRequest = useApprovePointsPurchaseRequest();
  const rejectPointsRequest = useRejectPointsPurchaseRequest();
  const updateSettings = useUpdateConversionSettings();

  const [bdtToPoints, setBdtToPoints] = useState('');
  const [pointsToDiamonds, setPointsToDiamonds] = useState('');
  const [diamondsPerPackage, setDiamondsPerPackage] = useState('');

  const handleApproveWallet = async (transactionId: string) => {
    try {
      await approveTransaction.mutateAsync(transactionId);
      toast.success('Wallet transaction approved successfully');
    } catch (error) {
      toast.error('Failed to approve transaction');
    }
  };

  const handleRejectWallet = async (transactionId: string) => {
    try {
      await rejectTransaction.mutateAsync(transactionId);
      toast.success('Wallet transaction rejected');
    } catch (error) {
      toast.error('Failed to reject transaction');
    }
  };

  const handleApprovePoints = async (requestId: string) => {
    try {
      await approvePointsRequest.mutateAsync(requestId);
      toast.success('Points purchase request approved successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve request');
    }
  };

  const handleRejectPoints = async (requestId: string) => {
    try {
      await rejectPointsRequest.mutateAsync(requestId);
      toast.success('Points purchase request rejected');
    } catch (error) {
      toast.error('Failed to reject request');
    }
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSettings.mutateAsync({
        bdtToPointsRate: BigInt(bdtToPoints),
        pointsToDiamondsRate: BigInt(pointsToDiamonds),
        diamondsPerPackage: BigInt(diamondsPerPackage),
      });
      toast.success('Conversion settings updated successfully');
    } catch (error) {
      toast.error('Failed to update settings');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
      case 'delivered':
        return <Badge className="bg-green-500 text-white">Approved</Badge>;
      case 'rejected':
      case 'failed':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'processing':
        return <Badge className="bg-blue-500 text-white">Processing</Badge>;
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

  return (
    <div className="container mx-auto px-4 py-12 bg-white">
      <Toaster />
      <div className="flex items-center gap-2 mb-8">
        <Shield className="w-8 h-8 text-primary" />
        <h1 className="text-4xl font-bold text-gradient-purple">Admin Panel</h1>
      </div>

      {/* Dashboard Stats */}
      {dashboard && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card className="bg-white shadow-soft border-primary/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <p className="text-2xl font-bold text-primary">{dashboard.totalUsers.toString()}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-soft border-primary/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Points</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-primary" />
                <p className="text-2xl font-bold text-primary">{dashboard.totalPoints.toString()}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-soft border-primary/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Diamonds</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Gem className="w-5 h-5 text-primary" />
                <p className="text-2xl font-bold text-primary">{dashboard.totalDiamonds.toString()}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-soft border-primary/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <p className="text-2xl font-bold text-primary">৳{dashboard.totalRevenue.toString()}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-soft border-primary/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Ad Profit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Tv className="w-5 h-5 text-primary" />
                <p className="text-2xl font-bold text-primary">৳{dashboard.totalAdProfit.toString()}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="wallet" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 bg-muted/30">
          <TabsTrigger value="wallet">
            <Wallet className="w-4 h-4 mr-2" />
            Wallet
          </TabsTrigger>
          <TabsTrigger value="points-requests">
            <Coins className="w-4 h-4 mr-2" />
            Points Requests
          </TabsTrigger>
          <TabsTrigger value="points">
            <Coins className="w-4 h-4 mr-2" />
            Points
          </TabsTrigger>
          <TabsTrigger value="diamonds">
            <Gem className="w-4 h-4 mr-2" />
            Diamonds
          </TabsTrigger>
          <TabsTrigger value="users">
            <Users className="w-4 h-4 mr-2" />
            Users
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Wallet Transactions Tab */}
        <TabsContent value="wallet">
          <Card className="border-primary/30 shadow-soft bg-white">
            <CardHeader>
              <CardTitle>Wallet Top-Up Transactions</CardTitle>
              <CardDescription>Approve or reject wallet top-up requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transaction ID</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell className="font-mono text-sm">{tx.transactionId}</TableCell>
                        <TableCell className="font-mono text-xs">{tx.user.toString().slice(0, 10)}...</TableCell>
                        <TableCell className="capitalize">{tx.paymentMethod}</TableCell>
                        <TableCell>৳{tx.amount.toString()}</TableCell>
                        <TableCell>{getStatusBadge(tx.status)}</TableCell>
                        <TableCell>
                          {tx.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleApproveWallet(tx.id)}
                                disabled={approveTransaction.isPending}
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                {approveTransaction.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleRejectWallet(tx.id)}
                                disabled={rejectTransaction.isPending}
                              >
                                {rejectTransaction.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Points Purchase Requests Tab */}
        <TabsContent value="points-requests">
          <Card className="border-primary/30 shadow-soft bg-white">
            <CardHeader>
              <CardTitle>Points Purchase Requests</CardTitle>
              <CardDescription>Approve or reject points purchase requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Request ID</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>BDT Amount</TableHead>
                      <TableHead>Points</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pointsPurchaseRequests.map((req) => (
                      <TableRow key={req.id}>
                        <TableCell className="font-mono text-sm">{req.id}</TableCell>
                        <TableCell className="font-mono text-xs">{req.user.toString().slice(0, 10)}...</TableCell>
                        <TableCell>৳{req.bdtAmount.toString()}</TableCell>
                        <TableCell>{req.amount.toString()} Points</TableCell>
                        <TableCell>{getStatusBadge(req.status)}</TableCell>
                        <TableCell>
                          {req.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleApprovePoints(req.id)}
                                disabled={approvePointsRequest.isPending}
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                {approvePointsRequest.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleRejectPoints(req.id)}
                                disabled={rejectPointsRequest.isPending}
                              >
                                {rejectPointsRequest.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Points Transactions Tab */}
        <TabsContent value="points">
          <Card className="border-primary/30 shadow-soft bg-white">
            <CardHeader>
              <CardTitle>Points Transactions</CardTitle>
              <CardDescription>View all points transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pointsTransactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell>{getPointsTransactionTypeBadge(tx.transactionType)}</TableCell>
                        <TableCell className="font-mono text-xs">{tx.user.toString().slice(0, 10)}...</TableCell>
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* Diamonds Tab */}
        <TabsContent value="diamonds">
          <Card className="border-primary/30 shadow-soft bg-white">
            <CardHeader>
              <CardTitle>Diamond Purchases</CardTitle>
              <CardDescription>View all diamond purchases</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Package</TableHead>
                      <TableHead>Points Deducted</TableHead>
                      <TableHead>Diamonds Awarded</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {diamondPurchases.map((purchase) => (
                      <TableRow key={purchase.id}>
                        <TableCell className="font-mono text-xs">{purchase.user.toString().slice(0, 10)}...</TableCell>
                        <TableCell>{purchase.packageName}</TableCell>
                        <TableCell>{purchase.pointsDeducted.toString()} Points</TableCell>
                        <TableCell>{purchase.diamondsAwarded.toString()} Diamonds</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(Number(purchase.createdAt) / 1000000).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users">
          <Card className="border-primary/30 shadow-soft bg-white">
            <CardHeader>
              <CardTitle>All Users</CardTitle>
              <CardDescription>View all registered users</CardDescription>
            </CardHeader>
            <CardContent>
              {users.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No users found</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Principal ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => {
                        const [principal, profile] = user;
                        return (
                          <TableRow key={principal.toString()}>
                            <TableCell className="font-mono text-xs">{principal.toString().slice(0, 15)}...</TableCell>
                            <TableCell>{profile.name}</TableCell>
                            <TableCell>{profile.email}</TableCell>
                            <TableCell>{profile.phone}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <div className="grid gap-6">
            {/* Conversion Settings */}
            <Card className="border-primary/30 shadow-soft bg-white">
              <CardHeader>
                <CardTitle>Conversion Settings</CardTitle>
                <CardDescription>Update conversion rates for BDT to Points and Points to Diamonds</CardDescription>
              </CardHeader>
              <CardContent>
                {settings && (
                  <div className="mb-6 p-4 bg-purple-50 border border-primary/30 rounded-lg">
                    <p className="text-sm font-semibold text-primary mb-2">Current Settings:</p>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• {settings.bdtToPointsRate.toString()} BDT = 1 Point</li>
                      <li>• {settings.pointsToDiamondsRate.toString()} Points = {settings.diamondsPerPackage.toString()} Diamonds</li>
                    </ul>
                  </div>
                )}
                <form onSubmit={handleUpdateSettings} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="bdtToPoints">BDT per 1 Point</Label>
                    <Input
                      id="bdtToPoints"
                      type="number"
                      placeholder="e.g., 3"
                      value={bdtToPoints}
                      onChange={(e) => setBdtToPoints(e.target.value)}
                      min="1"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pointsToDiamonds">Points per Diamond Package</Label>
                    <Input
                      id="pointsToDiamonds"
                      type="number"
                      placeholder="e.g., 10"
                      value={pointsToDiamonds}
                      onChange={(e) => setPointsToDiamonds(e.target.value)}
                      min="1"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="diamondsPerPackage">Diamonds per Package</Label>
                    <Input
                      id="diamondsPerPackage"
                      type="number"
                      placeholder="e.g., 100"
                      value={diamondsPerPackage}
                      onChange={(e) => setDiamondsPerPackage(e.target.value)}
                      min="1"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={updateSettings.isPending}
                    className="w-full btn-purple-gradient"
                  >
                    {updateSettings.isPending ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      'Update Settings'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Ad Analytics */}
            {adAnalytics && (
              <Card className="border-primary/30 shadow-soft bg-white">
                <CardHeader>
                  <CardTitle>Ad Rewards Analytics</CardTitle>
                  <CardDescription>Track ad-earned points and profit</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-purple-50 border border-primary/30 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Total Ad Rewards</p>
                      <p className="text-2xl font-bold text-primary">{adAnalytics.totalAdRewards.toString()} Points</p>
                    </div>
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Total Ad Profit (3 BDT per point)</p>
                      <p className="text-2xl font-bold text-green-600">৳{adAnalytics.totalProfit.toString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, Users, ShoppingBag, Wallet, Check, X } from 'lucide-react';
import {
  useGetAllTransactions,
  useApproveTransaction,
  useRejectTransaction,
} from '../../hooks/useAdmin';
import { useGetAllOrders } from '../../hooks/useOrders';
import { useGetUsers } from '../../hooks/useQueries';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';

export default function AdminPanelPage() {
  const { data: transactions = [] } = useGetAllTransactions();
  const { data: orders = [] } = useGetAllOrders();
  const { data: users = [] } = useGetUsers();
  const approveTransaction = useApproveTransaction();
  const rejectTransaction = useRejectTransaction();

  const handleApprove = async (transactionId: string) => {
    try {
      await approveTransaction.mutateAsync(transactionId);
      toast.success('Transaction approved successfully!');
    } catch (error) {
      toast.error('Failed to approve transaction');
    }
  };

  const handleReject = async (transactionId: string) => {
    try {
      await rejectTransaction.mutateAsync(transactionId);
      toast.success('Transaction rejected');
    } catch (error) {
      toast.error('Failed to reject transaction');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
      case 'delivered':
        return <Badge className="bg-green-500 text-white">Approved/Delivered</Badge>;
      case 'rejected':
      case 'failed':
        return <Badge variant="destructive">Rejected/Failed</Badge>;
      case 'processing':
        return <Badge className="bg-blue-500 text-white">Processing</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 bg-white">
      <Toaster />
      <div className="flex items-center gap-2 mb-8">
        <Shield className="w-8 h-8 text-primary" />
        <h1 className="text-4xl font-bold text-gradient-purple">Admin Panel</h1>
      </div>

      <Tabs defaultValue="transactions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-muted/30">
          <TabsTrigger value="transactions">
            <Wallet className="w-4 h-4 mr-2" />
            Transactions
          </TabsTrigger>
          <TabsTrigger value="orders">
            <ShoppingBag className="w-4 h-4 mr-2" />
            Orders
          </TabsTrigger>
          <TabsTrigger value="users">
            <Users className="w-4 h-4 mr-2" />
            Users
          </TabsTrigger>
        </TabsList>

        <TabsContent value="transactions">
          <Card className="border-primary/30 shadow-soft bg-white">
            <CardHeader>
              <CardTitle>Wallet Top-Up Transactions</CardTitle>
              <CardDescription>Manage user wallet top-up requests</CardDescription>
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
                                  onClick={() => handleApprove(tx.transactionId)}
                                  disabled={approveTransaction.isPending}
                                  className="bg-green-500 hover:bg-green-600 text-white"
                                >
                                  <Check className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleReject(tx.transactionId)}
                                  disabled={rejectTransaction.isPending}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
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

        <TabsContent value="orders">
          <Card className="border-primary/30 shadow-soft bg-white">
            <CardHeader>
              <CardTitle>All Orders</CardTitle>
              <CardDescription>View all product orders</CardDescription>
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
                        <TableHead>User</TableHead>
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
                          <TableCell className="font-mono text-xs">{order.user.toString().slice(0, 10)}...</TableCell>
                          <TableCell>{order.productId}</TableCell>
                          <TableCell>৳{order.amount.toString()}</TableCell>
                          <TableCell>{getStatusBadge(order.status)}</TableCell>
                          <TableCell>
                            {order.isAutoDelivery ? (
                              <Badge variant="secondary" className="bg-primary/20 text-primary">Yes</Badge>
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

        <TabsContent value="users">
          <Card className="border-primary/30 shadow-soft bg-white">
            <CardHeader>
              <CardTitle>Registered Users</CardTitle>
              <CardDescription>View all registered users</CardDescription>
            </CardHeader>
            <CardContent>
              {users.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No users yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Principal</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map(([principal, profile]) => (
                        <TableRow key={principal.toString()}>
                          <TableCell className="font-mono text-xs">{principal.toString().slice(0, 15)}...</TableCell>
                          <TableCell>{profile.name}</TableCell>
                          <TableCell>{profile.email}</TableCell>
                          <TableCell>{profile.phone}</TableCell>
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

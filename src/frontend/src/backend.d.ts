import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Product {
    id: number;
    name: string;
    price: bigint;
    isAutoDelivery: boolean;
}
export type Time = bigint;
export interface AdminDashboard {
    totalAdProfit: bigint;
    totalDiamonds: bigint;
    totalUsers: bigint;
    totalPoints: bigint;
    totalRevenue: bigint;
}
export interface PointsTransaction {
    id: string;
    transactionType: PointsTransactionType;
    metadata: string;
    createdAt: Time;
    user: Principal;
    amount: bigint;
}
export interface WalletTopUpTransaction {
    id: string;
    status: TransactionStatus;
    paymentMethod: PaymentMethod;
    createdAt: Time;
    user: Principal;
    amount: bigint;
    transactionId: string;
}
export interface DiamondPurchase {
    id: string;
    packageName: string;
    createdAt: Time;
    user: Principal;
    diamondsAwarded: bigint;
    pointsDeducted: bigint;
}
export interface PointsPurchaseRequest {
    id: string;
    status: PointsPurchaseStatus;
    createdAt: Time;
    user: Principal;
    amount: bigint;
    bdtAmount: bigint;
}
export interface UserProfile {
    name: string;
    email: string;
    phone: string;
}
export interface ConversionSettings {
    pointsToDiamondsRate: bigint;
    diamondsPerPackage: bigint;
    bdtToPointsRate: bigint;
}
export enum PaymentMethod {
    nagad = "nagad",
    bkash = "bkash"
}
export enum PointsTransactionType {
    adReward = "adReward",
    adminAdjustment = "adminAdjustment",
    spend = "spend",
    purchase = "purchase"
}
export enum TransactionStatus {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addProduct(name: string, price: bigint, isAutoDelivery: boolean): Promise<number>;
    approvePointsPurchaseRequest(requestId: string): Promise<boolean>;
    approveWalletTopUpTransaction(transactionId: string): Promise<boolean>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    claimAdReward(transactionId: string): Promise<boolean>;
    deleteProduct(productId: number): Promise<void>;
    getAdRewardsAnalytics(): Promise<{
        totalProfit: bigint;
        totalAdRewards: bigint;
    }>;
    getAdminDashboard(): Promise<AdminDashboard>;
    getAllDiamondPurchases(): Promise<Array<DiamondPurchase>>;
    getAllPointsPurchaseRequests(): Promise<Array<PointsPurchaseRequest>>;
    getAllPointsTransactions(): Promise<Array<PointsTransaction>>;
    getAllWalletTopUpTransactions(): Promise<Array<WalletTopUpTransaction>>;
    getCallerBalance(): Promise<bigint>;
    getCallerDailyAdCount(): Promise<bigint>;
    getCallerDiamondPurchases(): Promise<Array<DiamondPurchase>>;
    getCallerPointsBalance(): Promise<bigint>;
    getCallerPointsPurchaseRequests(): Promise<Array<PointsPurchaseRequest>>;
    getCallerPointsTransactions(): Promise<Array<PointsTransaction>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCallerWalletTransactions(): Promise<Array<WalletTopUpTransaction>>;
    getConversionSettings(): Promise<ConversionSettings>;
    getProducts(): Promise<Array<Product>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    purchaseDiamondsWithPoints(packageName: string, transactionId: string): Promise<boolean>;
    rejectPointsPurchaseRequest(requestId: string): Promise<boolean>;
    rejectWalletTopUpTransaction(transactionId: string): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitAddMoneyTransaction(amount: bigint, paymentMethod: PaymentMethod, transactionId: string): Promise<void>;
    submitPointsPurchaseRequest(bdtAmount: bigint, transactionId: string): Promise<void>;
    updateConversionSettings(bdtToPointsRate: bigint, pointsToDiamondsRate: bigint, diamondsPerPackage: bigint): Promise<void>;
    updateProduct(productId: number, name: string, price: bigint, isAutoDelivery: boolean): Promise<boolean>;
}

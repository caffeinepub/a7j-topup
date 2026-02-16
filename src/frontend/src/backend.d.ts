import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface ProductOrder {
    id: number;
    status: OrderStatus;
    createdAt: Time;
    user: Principal;
    productId: number;
    amount: bigint;
    isAutoDelivery: boolean;
}
export type Time = bigint;
export interface WalletTopUpTransaction {
    id: string;
    status: TransactionStatus;
    paymentMethod: PaymentMethod;
    createdAt: Time;
    user: Principal;
    amount: bigint;
    transactionId: string;
}
export interface Product {
    id: number;
    name: string;
    price: bigint;
    isAutoDelivery: boolean;
}
export interface UserProfile {
    name: string;
    email: string;
    phone: string;
}
export enum OrderStatus {
    pending = "pending",
    delivered = "delivered",
    processing = "processing",
    failed = "failed"
}
export enum PaymentMethod {
    nagad = "nagad",
    bkash = "bkash"
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
    approveWalletTopUpTransaction(transactionId: string): Promise<boolean>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    claimAdminAccess(username: string, password: string): Promise<boolean>;
    createOrder(productId: number): Promise<number>;
    deleteProduct(productId: number): Promise<void>;
    getAllOrdersSortedByTime(): Promise<Array<ProductOrder>>;
    getAllWalletTopUpTransactions(): Promise<Array<WalletTopUpTransaction>>;
    getCallerBalance(): Promise<bigint>;
    getCallerOrders(): Promise<Array<ProductOrder>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCallerWalletTopUpTransactions(): Promise<Array<WalletTopUpTransaction>>;
    getProducts(): Promise<Array<Product>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getUsers(): Promise<Array<[Principal, UserProfile]>>;
    isCallerAdmin(): Promise<boolean>;
    rejectWalletTopUpTransaction(transactionId: string): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitWalletTopUpTransaction(amount: bigint, paymentMethod: PaymentMethod, transactionId: string): Promise<void>;
    updateOrderStatus(orderId: number, newStatus: OrderStatus): Promise<boolean>;
    updateProduct(productId: number, name: string, price: bigint, isAutoDelivery: boolean): Promise<boolean>;
}

import Map "mo:core/Map";
import List "mo:core/List";
import Nat32 "mo:core/Nat32";
import Int "mo:core/Int";
import Nat64 "mo:core/Nat64";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";

module {
  public type OrderStatus = {
    #pending;
    #processing;
    #delivered;
    #failed;
  };

  public type TransactionStatus = {
    #pending;
    #approved;
    #rejected;
  };

  public type PaymentMethod = {
    #bkash;
    #nagad;
  };

  public type PointsTransactionType = {
    #purchase;
    #spend;
    #adReward;
    #adminAdjustment;
  };

  public type PointsPurchaseStatus = {
    #pending;
    #approved;
    #rejected;
  };

  public type ProductOrder = {
    id : Nat32;
    user : Principal;
    productId : Nat32;
    status : OrderStatus;
    amount : Nat64;
    createdAt : Time.Time;
    isAutoDelivery : Bool;
  };

  public type WalletTopUpTransaction = {
    id : Text;
    user : Principal;
    amount : Nat64;
    status : TransactionStatus;
    paymentMethod : PaymentMethod;
    createdAt : Time.Time;
    transactionId : Text;
  };

  public type UserProfile = {
    name : Text;
    email : Text;
    phone : Text;
  };

  public type Product = {
    id : Nat32;
    name : Text;
    price : Nat64;
    isAutoDelivery : Bool;
  };

  public type PointsTransaction = {
    id : Text;
    user : Principal;
    amount : Int;
    transactionType : PointsTransactionType;
    createdAt : Time.Time;
    metadata : Text;
  };

  public type DiamondPurchase = {
    id : Text;
    user : Principal;
    pointsDeducted : Nat64;
    diamondsAwarded : Nat64;
    packageName : Text;
    createdAt : Time.Time;
  };

  public type ConversionSettings = {
    bdtToPointsRate : Nat64;
    pointsToDiamondsRate : Nat64;
    diamondsPerPackage : Nat64;
  };

  public type PointsPurchaseRequest = {
    id : Text;
    user : Principal;
    amount : Int;
    bdtAmount : Nat64;
    status : PointsPurchaseStatus;
    createdAt : Time.Time;
  };

  public type OldActor = {
    accessControlState : AccessControl.AccessControlState;
    userProfiles : Map.Map<Principal, UserProfile>;
    walletTopUpTransactions : Map.Map<Text, WalletTopUpTransaction>;
    productOrders : Map.Map<Principal, List.List<ProductOrder>>;
    products : Map.Map<Nat32, Product>;
    userBalances : Map.Map<Principal, Nat64>;
    userPointsBalances : Map.Map<Principal, Int>;
    pointsTransactions : Map.Map<Text, PointsTransaction>;
    diamondPurchases : Map.Map<Text, DiamondPurchase>;
    usedTransactionIds : Map.Map<Text, Bool>;
    userDailyAdCount : Map.Map<Principal, (Time.Time, Nat)>;
    pointsPurchaseRequests : Map.Map<Text, PointsPurchaseRequest>;
    adminDailyStats : Map.Map<Time.Time, (Nat, Nat64)>;
    conversionSettings : ConversionSettings;
    nextOrderId : Nat32;
    dailyAdLimit : Nat;
  };

  public type NewActor = OldActor;

  public func run(old : OldActor) : NewActor {
    old;
  };
};

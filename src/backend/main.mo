import List "mo:core/List";
import Map "mo:core/Map";
import Order "mo:core/Order";
import Array "mo:core/Array";
import Nat32 "mo:core/Nat32";
import Nat64 "mo:core/Nat64";
import Int "mo:core/Int";
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Nat "mo:core/Nat";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Types
  public type ProductOrder = {
    id : Nat32;
    user : Principal;
    productId : Nat32;
    status : OrderStatus;
    amount : Nat64;
    createdAt : Time.Time;
    isAutoDelivery : Bool;
  };

  public type OrderStatus = {
    #pending;
    #processing;
    #delivered;
    #failed;
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

  public type TransactionStatus = {
    #pending;
    #approved;
    #rejected;
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

  public type PaymentMethod = {
    #bkash;
    #nagad;
  };

  // Points System Types
  public type PointsTransaction = {
    id : Text;
    user : Principal;
    amount : Int;
    transactionType : PointsTransactionType;
    createdAt : Time.Time;
    metadata : Text;
  };

  public type PointsTransactionType = {
    #purchase; // Wallet to points
    #spend; // Points to diamonds
    #adReward; // Ad watching reward
    #adminAdjustment; // Admin manual adjustment
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
    bdtToPointsRate : Nat64; // BDT per 1 point (default 3)
    pointsToDiamondsRate : Nat64; // Points per diamond package (default 10 points = 100 diamonds)
    diamondsPerPackage : Nat64; // Diamonds awarded per package (default 100)
  };

  public type AdminDashboard = {
    totalUsers : Nat;
    totalPoints : Int;
    totalDiamonds : Nat64;
    totalRevenue : Nat64;
    totalAdProfit : Nat64;
  };

  // Points Purchase Request (new)
  public type PointsPurchaseRequest = {
    id : Text;
    user : Principal;
    amount : Int;
    bdtAmount : Nat64;
    status : PointsPurchaseStatus;
    createdAt : Time.Time;
  };

  public type PointsPurchaseStatus = {
    #pending;
    #approved;
    #rejected;
  };

  // State Management
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // States
  let userProfiles = Map.empty<Principal, UserProfile>();
  let walletTopUpTransactions = Map.empty<Text, WalletTopUpTransaction>();
  let productOrders = Map.empty<Principal, List.List<ProductOrder>>();
  let products = Map.empty<Nat32, Product>();
  let userBalances = Map.empty<Principal, Nat64>();

  // Points System States
  let userPointsBalances = Map.empty<Principal, Int>();
  let pointsTransactions = Map.empty<Text, PointsTransaction>();
  let diamondPurchases = Map.empty<Text, DiamondPurchase>();
  let usedTransactionIds = Map.empty<Text, Bool>();
  let userDailyAdCount = Map.empty<Principal, (Time.Time, Nat)>();
  let pointsPurchaseRequests = Map.empty<Text, PointsPurchaseRequest>(); // New
  let adminDailyStats = Map.empty<Time.Time, (Nat, Nat64)>(); // (pointsCount, totalRevenue)

  var conversionSettings : ConversionSettings = {
    bdtToPointsRate = 3;
    pointsToDiamondsRate = 10;
    diamondsPerPackage = 100;
  };

  var nextOrderId : Nat32 = 0;
  let dailyAdLimit : Nat = 10;

  // Helper Functions
  func getProductsList(products : Map.Map<Nat32, Product>) : List.List<Product> {
    let result = List.empty<Product>();
    for ((_, product) in products.entries()) {
      result.add(product);
    };
    result;
  };

  func isTransactionIdUsed(txId : Text) : Bool {
    switch (usedTransactionIds.get(txId)) {
      case (null) { false };
      case (?_) { true };
    };
  };

  func markTransactionIdUsed(txId : Text) {
    usedTransactionIds.add(txId, true);
  };

  func getUserPointsBalance(user : Principal) : Int {
    switch (userPointsBalances.get(user)) {
      case (null) { 0 };
      case (?balance) { balance };
    };
  };

  func updateUserPointsBalance(user : Principal, newBalance : Int) {
    userPointsBalances.add(user, newBalance);
  };

  func resetDailyAdCountIfNeeded(user : Principal) : Nat {
    let now = Time.now();
    let oneDayNanos = 86_400_000_000_000;

    switch (userDailyAdCount.get(user)) {
      case (null) {
        userDailyAdCount.add(user, (now, 0));
        0;
      };
      case (?(lastReset, count)) {
        if (now - lastReset >= oneDayNanos) {
          userDailyAdCount.add(user, (now, 0));
          0;
        } else {
          count;
        };
      };
    };
  };

  // Comparator for sorting transactions by createdAt
  module WalletTopUpTransaction {
    public func compareByCreatedAt(a : WalletTopUpTransaction, b : WalletTopUpTransaction) : Order.Order {
      Int.compare(b.createdAt, a.createdAt);
    };

    public func compareByUser(a : WalletTopUpTransaction, b : WalletTopUpTransaction) : Order.Order {
      switch (Principal.compare(a.user, b.user)) {
        case (#equal) { compareByCreatedAt(a, b) };
        case (order) { order };
      };
    };
  };

  module ProductOrder {
    public func compareByCreatedAt(a : ProductOrder, b : ProductOrder) : Order.Order {
      Int.compare(b.createdAt, a.createdAt);
    };

    public func compareByUser(a : ProductOrder, b : ProductOrder) : Order.Order {
      switch (Principal.compare(a.user, b.user)) {
        case (#equal) { compareByCreatedAt(a, b) };
        case (order) { order };
      };
    };
  };

  module PointsTransaction {
    public func compareByCreatedAt(a : PointsTransaction, b : PointsTransaction) : Order.Order {
      Int.compare(b.createdAt, a.createdAt);
    };
  };

  module DiamondPurchase {
    public func compareByCreatedAt(a : DiamondPurchase, b : DiamondPurchase) : Order.Order {
      Int.compare(b.createdAt, a.createdAt);
    };
  };

  module PointsPurchaseRequest {
    public func compareByCreatedAt(a : PointsPurchaseRequest, b : PointsPurchaseRequest) : Order.Order {
      Int.compare(b.createdAt, a.createdAt);
    };
  };

  // ========== USER PROFILE MANAGEMENT (REQUIRED) ==========

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // ========== PRODUCT MANAGEMENT ==========

  public shared ({ caller }) func addProduct(name : Text, price : Nat64, isAutoDelivery : Bool) : async Nat32 {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    let productId = Nat32.fromNat(products.size());
    let newProduct : Product = {
      id = productId;
      name;
      price;
      isAutoDelivery;
    };
    products.add(productId, newProduct);
    productId;
  };

  public shared ({ caller }) func updateProduct(productId : Nat32, name : Text, price : Nat64, isAutoDelivery : Bool) : async Bool {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    switch (products.get(productId)) {
      case (null) { false };
      case (?_) {
        let updatedProduct : Product = {
          id = productId;
          name;
          price;
          isAutoDelivery;
        };
        products.add(productId, updatedProduct);
        true;
      };
    };
  };

  public shared ({ caller }) func deleteProduct(productId : Nat32) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    products.remove(productId);
  };

  public query func getProducts() : async [Product] {
    let result = getProductsList(products);
    result.toArray();
  };

  // ========== WALLET MANAGEMENT ("Add Money") ==========

  public shared ({ caller }) func submitAddMoneyTransaction(
    amount : Nat64,
    paymentMethod : PaymentMethod,
    transactionId : Text,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can submit add money requests");
    };

    if (amount == 0) {
      Runtime.trap("Amount must be greater than 0");
    };

    let trimmedTxId = transactionId.trim(#char ' ');
    if (trimmedTxId.size() == 0) {
      Runtime.trap("Transaction ID cannot be empty");
    };

    if (isTransactionIdUsed(trimmedTxId)) {
      Runtime.trap("Transaction ID already used");
    };

    let newTransaction : WalletTopUpTransaction = {
      id = trimmedTxId;
      user = caller;
      amount;
      status = #pending;
      paymentMethod;
      createdAt = Time.now();
      transactionId = trimmedTxId;
    };

    walletTopUpTransactions.add(trimmedTxId, newTransaction);
    markTransactionIdUsed(trimmedTxId);
  };

  public query ({ caller }) func getCallerWalletTransactions() : async [WalletTopUpTransaction] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view their requests");
    };

    let userRequests = walletTopUpTransactions.values().toArray().filter(
      func(request) { request.user == caller }
    ).sort(
      WalletTopUpTransaction.compareByCreatedAt
    );
    userRequests;
  };

  public query ({ caller }) func getCallerBalance() : async Nat64 {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view their balance");
    };

    switch (userBalances.get(caller)) {
      case (null) { 0 : Nat64 };
      case (?balance) { balance };
    };
  };

  // Admin: Approve Wallet Top-Up
  public shared ({ caller }) func approveWalletTopUpTransaction(transactionId : Text) : async Bool {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can approve wallet top-ups");
    };

    switch (walletTopUpTransactions.get(transactionId)) {
      case (null) { false };
      case (?transaction) {
        if (transaction.status != #pending) {
          return false;
        };

        let updatedTransaction = {
          transaction with status = #approved;
        };
        walletTopUpTransactions.add(transactionId, updatedTransaction);

        // Credit user wallet balance
        let currentBalance = switch (userBalances.get(transaction.user)) {
          case (null) { 0 : Nat64 };
          case (?balance) { balance };
        };
        userBalances.add(transaction.user, currentBalance + transaction.amount);

        true;
      };
    };
  };

  // Admin: Reject Wallet Top-Up
  public shared ({ caller }) func rejectWalletTopUpTransaction(transactionId : Text) : async Bool {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can reject wallet top-ups");
    };

    switch (walletTopUpTransactions.get(transactionId)) {
      case (null) { false };
      case (?transaction) {
        if (transaction.status != #pending) {
          return false;
        };

        let updatedTransaction = {
          transaction with status = #rejected;
        };
        walletTopUpTransactions.add(transactionId, updatedTransaction);
        true;
      };
    };
  };

  // ========== POINTS SYSTEM ENHANCED ==========

  // Points Purchase Request (Wallet to Points)
  public shared ({ caller }) func submitPointsPurchaseRequest(bdtAmount : Nat64, transactionId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can submit points purchase requests");
    };

    if (bdtAmount == 0) {
      Runtime.trap("Amount must be greater than 0");
    };

    let trimmedTxId = transactionId.trim(#char ' ');
    if (trimmedTxId.size() == 0) {
      Runtime.trap("Transaction ID cannot be empty");
    };

    if (isTransactionIdUsed(trimmedTxId)) {
      Runtime.trap("Transaction ID already used");
    };

    // Check wallet balance
    let currentBalance = switch (userBalances.get(caller)) {
      case (null) { 0 : Nat64 };
      case (?balance) { balance };
    };

    if (currentBalance < bdtAmount) {
      Runtime.trap("Insufficient wallet balance");
    };

    let pointsToCreditNat64 = bdtAmount / conversionSettings.bdtToPointsRate;
    let pointsToCreditNat : Nat = pointsToCreditNat64.toNat();
    if (pointsToCreditNat == 0) {
      Runtime.trap("Amount too small to convert to points");
    };

    // Create points purchase request
    let newRequest : PointsPurchaseRequest = {
      id = trimmedTxId;
      user = caller;
      amount = Int.fromNat(pointsToCreditNat);
      bdtAmount;
      status = #pending;
      createdAt = Time.now();
    };

    pointsPurchaseRequests.add(trimmedTxId, newRequest);
    markTransactionIdUsed(trimmedTxId);
  };

  public query ({ caller }) func getCallerPointsPurchaseRequests() : async [PointsPurchaseRequest] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view their points purchase requests");
    };

    let userRequests = pointsPurchaseRequests.values().toArray().filter(
      func(request) { request.user == caller }
    ).sort(
      PointsPurchaseRequest.compareByCreatedAt
    );
    userRequests;
  };

  // Admin Actions for Points Purchase Requests
  public shared ({ caller }) func approvePointsPurchaseRequest(requestId : Text) : async Bool {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can approve points purchase requests");
    };

    switch (pointsPurchaseRequests.get(requestId)) {
      case (null) { false };
      case (?request) {
        if (request.status != #pending) {
          return false;
        };

        // Verify user has sufficient wallet balance
        let currentBalance = switch (userBalances.get(request.user)) {
          case (null) { 0 : Nat64 };
          case (?balance) { balance };
        };

        if (currentBalance < request.bdtAmount) {
          Runtime.trap("User has insufficient wallet balance");
        };

        // Deduct wallet balance
        userBalances.add(request.user, currentBalance - request.bdtAmount);

        // Update request status
        let updatedRequest = {
          request with status = #approved;
        };
        pointsPurchaseRequests.add(requestId, updatedRequest);

        // Update user points balance
        let currentPoints = getUserPointsBalance(request.user);
        updateUserPointsBalance(request.user, currentPoints + request.amount);

        // Record points transaction
        let transaction : PointsTransaction = {
          id = requestId # "_purchase";
          user = request.user;
          amount = request.amount;
          transactionType = #purchase;
          createdAt = Time.now();
          metadata = "Points purchase approved: " # request.amount.toText() # " points for " # request.bdtAmount.toText() # " BDT";
        };
        pointsTransactions.add(requestId # "_purchase", transaction);

        // Update admin daily stats
        let now = Time.now();
        switch (adminDailyStats.get(now)) {
          case (null) {
            adminDailyStats.add(now, (1, request.bdtAmount));
          };
          case (?(pointsCount, totalRevenue)) {
            adminDailyStats.add(now, (pointsCount + 1, totalRevenue + request.bdtAmount));
          };
        };

        true;
      };
    };
  };

  public shared ({ caller }) func rejectPointsPurchaseRequest(requestId : Text) : async Bool {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can reject points purchase requests");
    };

    switch (pointsPurchaseRequests.get(requestId)) {
      case (null) { false };
      case (?request) {
        if (request.status != #pending) {
          return false;
        };

        let updatedRequest = {
          request with status = #rejected;
        };
        pointsPurchaseRequests.add(requestId, updatedRequest);
        true;
      };
    };
  };

  // Points to Diamonds Purchase
  public shared ({ caller }) func purchaseDiamondsWithPoints(packageName : Text, transactionId : Text) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can purchase diamonds");
    };

    let trimmedTxId = transactionId.trim(#char ' ');
    if (isTransactionIdUsed(trimmedTxId)) {
      Runtime.trap("Transaction ID already used");
    };

    let pointsRequired = conversionSettings.pointsToDiamondsRate;
    let diamondsAwarded = conversionSettings.diamondsPerPackage;
    let currentPoints = getUserPointsBalance(caller);

    if (currentPoints < Int.fromNat(pointsRequired.toNat())) {
      Runtime.trap("Insufficient points balance");
    };

    updateUserPointsBalance(caller, currentPoints - Int.fromNat(pointsRequired.toNat()));

    let purchase : DiamondPurchase = {
      id = trimmedTxId;
      user = caller;
      pointsDeducted = pointsRequired;
      diamondsAwarded;
      packageName;
      createdAt = Time.now();
    };
    diamondPurchases.add(trimmedTxId, purchase);

    let transaction : PointsTransaction = {
      id = trimmedTxId # "_spend";
      user = caller;
      amount = -Int.fromNat(pointsRequired.toNat());
      transactionType = #spend;
      createdAt = Time.now();
      metadata = "Purchased " # packageName # " (" # diamondsAwarded.toText() # " diamonds) for " # pointsRequired.toText() # " points";
    };
    pointsTransactions.add(trimmedTxId # "_spend", transaction);
    markTransactionIdUsed(trimmedTxId);

    true;
  };

  // Ad Reward System
  public shared ({ caller }) func claimAdReward(transactionId : Text) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can claim ad rewards");
    };

    let trimmedTxId = transactionId.trim(#char ' ');
    if (isTransactionIdUsed(trimmedTxId)) {
      Runtime.trap("Transaction ID already used");
    };

    let currentAdCount = resetDailyAdCountIfNeeded(caller);
    if (currentAdCount >= dailyAdLimit) {
      Runtime.trap("Daily ad limit reached");
    };

    let currentPoints = getUserPointsBalance(caller);
    updateUserPointsBalance(caller, currentPoints + 1);

    let now = Time.now();
    userDailyAdCount.add(caller, (now, currentAdCount + 1));

    let transaction : PointsTransaction = {
      id = trimmedTxId;
      user = caller;
      amount = 1;
      transactionType = #adReward;
      createdAt = Time.now();
      metadata = "Ad reward: +1 point";
    };
    pointsTransactions.add(trimmedTxId, transaction);
    markTransactionIdUsed(trimmedTxId);

    true;
  };

  // Query: Get Conversion Settings (public - no auth needed)
  public query func getConversionSettings() : async ConversionSettings {
    conversionSettings;
  };

  // Query: Get User Points Balance
  public query ({ caller }) func getCallerPointsBalance() : async Int {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view their points balance");
    };
    getUserPointsBalance(caller);
  };

  // Query: Get User Points Transactions
  public query ({ caller }) func getCallerPointsTransactions() : async [PointsTransaction] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view their transactions");
    };

    let userTransactions = pointsTransactions.values().toArray().filter(
      func(tx) { tx.user == caller }
    ).sort(PointsTransaction.compareByCreatedAt);

    userTransactions;
  };

  // Query: Get User Diamond Purchases
  public query ({ caller }) func getCallerDiamondPurchases() : async [DiamondPurchase] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view their diamond purchases");
    };

    let userPurchases = diamondPurchases.values().toArray().filter(
      func(purchase) { purchase.user == caller }
    ).sort(DiamondPurchase.compareByCreatedAt);

    userPurchases;
  };

  // Query: Get User Daily Ad Count
  public query ({ caller }) func getCallerDailyAdCount() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view their ad count");
    };

    resetDailyAdCountIfNeeded(caller);
  };

  // ========== ADMIN FUNCTIONS ==========

  // Admin: Conversion Rate & Daily Stats Management
  public shared ({ caller }) func updateConversionSettings(
    bdtToPointsRate : Nat64,
    pointsToDiamondsRate : Nat64,
    diamondsPerPackage : Nat64,
  ) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update conversion settings");
    };

    conversionSettings := {
      bdtToPointsRate;
      pointsToDiamondsRate;
      diamondsPerPackage;
    };
  };

  // Admin: Get All Points Purchase Requests
  public query ({ caller }) func getAllPointsPurchaseRequests() : async [PointsPurchaseRequest] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view all points purchase requests");
    };
    pointsPurchaseRequests.values().toArray().sort(PointsPurchaseRequest.compareByCreatedAt);
  };

  // Admin: Get All Wallet Top-Ups
  public query ({ caller }) func getAllWalletTopUpTransactions() : async [WalletTopUpTransaction] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    let result = walletTopUpTransactions.values().toArray().sort(
      WalletTopUpTransaction.compareByCreatedAt
    );
    result;
  };

  // Admin: Get All Points Transactions
  public query ({ caller }) func getAllPointsTransactions() : async [PointsTransaction] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view all points transactions");
    };

    pointsTransactions.values().toArray().sort(PointsTransaction.compareByCreatedAt);
  };

  // Admin: Get All Diamond Purchases
  public query ({ caller }) func getAllDiamondPurchases() : async [DiamondPurchase] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view all diamond purchases");
    };

    diamondPurchases.values().toArray().sort(DiamondPurchase.compareByCreatedAt);
  };

  // Admin: Get Ad Rewards Analytics
  public query ({ caller }) func getAdRewardsAnalytics() : async { totalAdRewards : Nat; totalProfit : Nat64 } {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view ad analytics");
    };

    var totalAdRewards : Nat = 0;
    for ((_, tx) in pointsTransactions.entries()) {
      switch (tx.transactionType) {
        case (#adReward) {
          totalAdRewards += tx.amount.toNat();
        };
        case (_) {};
      };
    };

    let totalProfit = Nat64.fromNat(totalAdRewards) * 3;

    { totalAdRewards; totalProfit };
  };

  // Admin: Get Dashboard Summary
  public query ({ caller }) func getAdminDashboard() : async AdminDashboard {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view dashboard");
    };

    let totalUsers = userProfiles.size();

    var totalPoints : Int = 0;
    for ((_, balance) in userPointsBalances.entries()) {
      totalPoints += balance;
    };

    var totalDiamonds : Nat64 = 0;
    for ((_, purchase) in diamondPurchases.entries()) {
      totalDiamonds += purchase.diamondsAwarded;
    };

    var totalRevenue : Nat64 = 0;
    for ((_, tx) in walletTopUpTransactions.entries()) {
      if (tx.status == #approved) {
        totalRevenue += tx.amount;
      };
    };

    var totalAdRewards : Nat = 0;
    for ((_, tx) in pointsTransactions.entries()) {
      switch (tx.transactionType) {
        case (#adReward) {
          totalAdRewards += tx.amount.toNat();
        };
        case (_) {};
      };
    };

    let totalAdProfit = Nat64.fromNat(totalAdRewards) * 3;

    {
      totalUsers;
      totalPoints;
      totalDiamonds;
      totalRevenue;
      totalAdProfit;
    };
  };
};

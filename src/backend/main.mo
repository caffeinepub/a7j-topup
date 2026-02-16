import Map "mo:core/Map";
import List "mo:core/List";
import Order "mo:core/Order";
import Array "mo:core/Array";
import Nat32 "mo:core/Nat32";
import Nat64 "mo:core/Nat64";
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Int "mo:core/Int";


import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

// Specify the data migration function in with-clause


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

  // State Management
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // States
  let userProfiles = Map.empty<Principal, UserProfile>();
  let walletTopUpTransactions = Map.empty<Text, WalletTopUpTransaction>();
  let productOrders = Map.empty<Principal, List.List<ProductOrder>>();
  let products = Map.empty<Nat32, Product>();
  let userBalances = Map.empty<Principal, Nat64>();

  var nextOrderId : Nat32 = 0;

  // Helper Functions
  func getProductsList(products : Map.Map<Nat32, Product>) : List.List<Product> {
    let result = List.empty<Product>();
    for ((_, product) in products.entries()) {
      result.add(product);
    };
    result;
  };

  // Comparator for sorting transactions by createdAt
  module WalletTopUpTransaction {
    public func compareByCreatedAt(a : WalletTopUpTransaction, b : WalletTopUpTransaction) : Order.Order {
      Int.compare(b.createdAt, a.createdAt); // Descending order
    };

    public func compareByUser(a : WalletTopUpTransaction, b : WalletTopUpTransaction) : Order.Order {
      switch (Principal.compare(a.user, b.user)) {
        case (#equal) { compareByCreatedAt(a, b) };
        case (order) { order };
      };
    };
  };

  // Comparator for sorting orders by createdAt
  module ProductOrder {
    public func compareByCreatedAt(a : ProductOrder, b : ProductOrder) : Order.Order {
      Int.compare(b.createdAt, a.createdAt); // Descending order
    };

    public func compareByUser(a : ProductOrder, b : ProductOrder) : Order.Order {
      switch (Principal.compare(a.user, b.user)) {
        case (#equal) { compareByCreatedAt(a, b) };
        case (order) { order };
      };
    };
  };

  // Product Management
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

  public query ({ caller }) func getProducts() : async [Product] {
    // Public endpoint - no authorization needed
    let result = getProductsList(products);
    result.toArray();
  };

  // Wallet Management
  public shared ({ caller }) func submitWalletTopUpTransaction(
    amount : Nat64,
    paymentMethod : PaymentMethod,
    transactionId : Text,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can submit wallet top-up requests");
    };

    let newTransaction : WalletTopUpTransaction = {
      id = transactionId;
      user = caller;
      amount;
      status = #pending;
      paymentMethod;
      createdAt = Time.now();
      transactionId;
    };

    walletTopUpTransactions.add(transactionId, newTransaction);
  };

  // Admin-only endpoint to get all top-up requests
  public query ({ caller }) func getAllWalletTopUpTransactions() : async [WalletTopUpTransaction] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    let result = walletTopUpTransactions.values().toArray().sort(
      WalletTopUpTransaction.compareByCreatedAt
    );
    result;
  };

  public shared ({ caller }) func approveWalletTopUpTransaction(transactionId : Text) : async Bool {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can approve top-up requests");
    };

    switch (walletTopUpTransactions.get(transactionId)) {
      case (null) { false };
      case (?transaction) {
        if (transaction.status == #pending) {
          let approvedTransaction = {
            transaction with status = #approved;
          };
          walletTopUpTransactions.add(transactionId, approvedTransaction);

          // Update user balance using the user from the request
          let currentBalance = switch (userBalances.get(transaction.user)) {
            case (null) { 0 : Nat64 };
            case (?balance) { balance };
          };
          userBalances.add(transaction.user, currentBalance + transaction.amount);
        };
        true;
      };
    };
  };

  public shared ({ caller }) func rejectWalletTopUpTransaction(transactionId : Text) : async Bool {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can reject top-up requests");
    };

    switch (walletTopUpTransactions.get(transactionId)) {
      case (null) { false };
      case (?transaction) {
        if (transaction.status == #pending) {
          let rejectedTransaction = {
            transaction with status = #rejected;
          };
          walletTopUpTransactions.add(transactionId, rejectedTransaction);
        };
        true;
      };
    };
  };

  // User Wallet Functions
  public query ({ caller }) func getCallerWalletTopUpTransactions() : async [WalletTopUpTransaction] {
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
      case (null) { 0 };
      case (?balance) { balance };
    };
  };

  // User Management
  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

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

  // Order Management
  public shared ({ caller }) func createOrder(productId : Nat32) : async Nat32 {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create orders");
    };

    switch (products.get(productId)) {
      case (null) {
        Runtime.trap("Product not found");
      };
      case (?product) {
        // Check if user has sufficient balance
        let userBalance = switch (userBalances.get(caller)) {
          case (null) { 0 : Nat64 };
          case (?balance) { balance };
        };

        if (userBalance < product.price) {
          Runtime.trap("Insufficient balance");
        };

        // Deduct from balance
        userBalances.add(caller, userBalance - product.price);

        // Create order
        let orderId = nextOrderId;
        nextOrderId += 1;

        let newOrder : ProductOrder = {
          id = orderId;
          user = caller;
          productId;
          status = #pending;
          amount = product.price;
          createdAt = Time.now();
          isAutoDelivery = product.isAutoDelivery;
        };

        let userOrders = switch (productOrders.get(caller)) {
          case (null) { List.empty<ProductOrder>() };
          case (?existing) { existing };
        };

        userOrders.add(newOrder);
        productOrders.add(caller, userOrders);

        orderId;
      };
    };
  };

  public query ({ caller }) func getCallerOrders() : async [ProductOrder] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view their orders");
    };

    switch (productOrders.get(caller)) {
      case (null) { [] };
      case (?orders) {
        let orderArray = orders.toArray();
        orderArray.sort(ProductOrder.compareByCreatedAt);
      };
    };
  };

  public shared ({ caller }) func updateOrderStatus(orderId : Nat32, newStatus : OrderStatus) : async Bool {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    var found = false;
    for ((user, orders) in productOrders.entries()) {
      if (not found) {
        let updatedOrders = orders.map<ProductOrder, ProductOrder>(
          func(order) {
            if (order.id == orderId) {
              found := true;
              { order with status = newStatus };
            } else {
              order;
            };
          }
        );
        if (found) {
          productOrders.add(user, updatedOrders);
        };
      };
    };
    found;
  };

  // Admin Functions
  public query ({ caller }) func getAllOrdersSortedByTime() : async [ProductOrder] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    let allOrders : [ProductOrder] = productOrders.entries().foldLeft(
      [] : [ProductOrder],
      func(acc, (_, orders)) { acc.concat(orders.toArray()) },
    );

    allOrders.sort(ProductOrder.compareByCreatedAt);
  };

  public query ({ caller }) func getUsers() : async [(Principal, UserProfile)] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    let usersArray = userProfiles.entries().toArray();
    usersArray.sort(compareByPrincipal);
  };

  func compareByPrincipal(a : (Principal, UserProfile), b : (Principal, UserProfile)) : Order.Order {
    Principal.compare(a.0, b.0);
  };
};

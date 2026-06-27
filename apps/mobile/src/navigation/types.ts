import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { CompositeNavigationProp, NavigatorScreenParams } from '@react-navigation/native';

// =============================================================================
// ROOT STACK — controls Auth vs App split
// =============================================================================

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  App: NavigatorScreenParams<AppTabParamList>;
};

// =============================================================================
// AUTH STACK — unauthenticated screens
// =============================================================================

export type AuthStackParamList = {
  Login: undefined;
};

// =============================================================================
// APP TABS — main bottom tab navigator (post-login)
// =============================================================================

export type AppTabParamList = {
  Dashboard: undefined;
  Orders: NavigatorScreenParams<OrdersStackParamList>;
  Catalog: NavigatorScreenParams<CatalogStackParamList>;
  Ledger: NavigatorScreenParams<LedgerStackParamList>;
  Profile: undefined;
};

// =============================================================================
// CATALOG STACK
// =============================================================================

export type CatalogStackParamList = {
  CategoryList: undefined;
  ProductList: { categoryId: string; categoryName: string };
  ProductDetail: { productId: string; productName: string };
};

// =============================================================================
// ORDERS STACK
// =============================================================================

export type OrdersStackParamList = {
  OrderList: undefined;
  OrderDetail: { orderId: string; orderNumber: string };
  Cart: undefined;
  Checkout: undefined;
};

// =============================================================================
// LEDGER STACK
// =============================================================================

export type LedgerStackParamList = {
  LedgerSummary: undefined;
  LedgerDetail: { customerId: string; companyName: string };
};

// =============================================================================
// TYPED NAVIGATION PROP HELPERS
// =============================================================================

export type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export type AppTabNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<AppTabParamList>,
  NativeStackNavigationProp<RootStackParamList>
>;

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { FirebaseAuthProvider } from '@/contexts/FirebaseAuthContext';
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import CompanyProfile from "./pages/CompanyProfile";
import Settings from "./pages/Settings";
import Invoices from "./pages/Invoices";
import CreateInvoice from "./pages/CreateInvoice";
import EnhancedCreateInvoice from "./pages/EnhancedCreateInvoice";
import InvoiceView from "./pages/InvoiceView";
import CreditNotes from "./pages/CreditNotes";
import CreateCreditNote from "./pages/CreateCreditNote";
import CreateDebitNote from "./pages/CreateDebitNote";
import Purchases from "./pages/Purchases";
import PurchaseOrders from "./pages/PurchaseOrders";
import DebitNotes from "./pages/DebitNotes";
import Quotations from "./pages/Quotations";
import Proforma from "./pages/Proforma";
import DeliveryChallans from "./pages/DeliveryChallans";
import CreateQuotation from "./pages/CreateQuotation";
import CreateProforma from "./pages/CreateProforma";
import CreatePurchase from "./pages/CreatePurchase";
import CreatePurchaseOrder from "./pages/CreatePurchaseOrder";
import CreateDeliveryChallan from "./pages/CreateDeliveryChallan";
import CreatePayment from "./pages/CreatePayment";
import Expenses from "./pages/Expenses";
import CreateExpense from "./pages/CreateExpense";
import Products from "./pages/Products";
import Inventory from "./pages/Inventory";
import Payments from "./pages/Payments";
import CustomerStatements from "./pages/CustomerStatements";
import Customers from "./pages/Customers";
import Vendors from "./pages/Vendors";
import Insights from "./pages/Insights";
import Reports from "./pages/Reports";
import OnlineStore from "./pages/OnlineStore";
import MagicLinkLogin from "./components/MagicLinkLogin";
import AuthCallback from "./pages/AuthCallback";
import FirebaseTest from "./components/FirebaseTest";
import TestFirebase from "./pages/TestFirebase";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <FirebaseAuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
            <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/magic-login" element={<MagicLinkLogin />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/firebase-test" element={<FirebaseTest />} />
          <Route path="/test-firebase" element={<TestFirebase />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/company-profile" element={<CompanyProfile />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/invoices/create" element={<EnhancedCreateInvoice />} />
          <Route path="/invoices/:id" element={<InvoiceView />} />
          <Route path="/credit-notes" element={<CreditNotes />} />
          <Route path="/credit-notes/create" element={<CreateCreditNote />} />
          <Route path="/debit-notes" element={<DebitNotes />} />
          <Route path="/debit-notes/create" element={<CreateDebitNote />} />
          <Route path="/purchases" element={<Purchases />} />
          <Route path="/purchases/create" element={<CreatePurchase />} />
          <Route path="/purchase-orders" element={<PurchaseOrders />} />
          <Route path="/purchase-orders/create" element={<CreatePurchaseOrder />} />
          <Route path="/quotations" element={<Quotations />} />
          <Route path="/quotations/create" element={<CreateQuotation />} />
          <Route path="/proformas" element={<Proforma />} />
          <Route path="/proformas/create" element={<CreateProforma />} />
          <Route path="/purchases/create" element={<CreatePurchase />} />
          <Route path="/delivery-challans" element={<DeliveryChallans />} />
          <Route path="/delivery-challans/create" element={<CreateDeliveryChallan />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/expenses/create" element={<CreateExpense />} />
          <Route path="/products" element={<Products />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/payments/create" element={<CreatePayment />} />
          <Route path="/customer-statements" element={<CustomerStatements />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/vendors" element={<Vendors />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/store" element={<OnlineStore />} />
          <Route path="/settings/profile" element={<Settings />} />
          <Route path="/settings/bank-accounts" element={<Settings />} />
          <Route path="/settings/signature" element={<Settings />} />
          <Route path="/settings/invoice" element={<Settings />} />
          <Route path="/settings/notifications" element={<Settings />} />
          <Route path="/settings/security" element={<Settings />} />
          <Route path="/settings/appearance" element={<Settings />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
            </Routes>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </FirebaseAuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

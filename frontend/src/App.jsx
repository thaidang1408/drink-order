import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Home } from './pages/Home';
import { StoreMenu } from './pages/StoreMenu';
import { Cart } from './pages/Cart';
import { OrderSuccess } from './pages/OrderSuccess';
import { OrderTracking } from './pages/OrderTracking';
import { MyOrders } from './pages/MyOrders';
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { OrdersBoard } from './pages/admin/OrdersBoard';
import { ProductManagement } from './pages/admin/ProductManagement';
import { CategoryManagement } from './pages/admin/CategoryManagement';
import { OptionGroupManagement } from './pages/admin/OptionGroupManagement';
import { PaymentSettings } from './pages/admin/PaymentSettings';
import { StoreSettings } from './pages/admin/StoreSettings';
import { QRDownload } from './pages/admin/QRDownload';
import { ProtectedRoute } from './components/admin/ProtectedRoute';

const App = () => (
  <BrowserRouter>
    <Routes>
      {/* Customer */}
      <Route path="/" element={<Home />} />
      <Route path="/store/:slug" element={<StoreMenu />} />
      <Route path="/store/:slug/cart" element={<Cart />} />
      <Route path="/store/:slug/order-success/:orderNumber" element={<OrderSuccess />} />
      <Route path="/store/:slug/track/:orderNumber" element={<OrderTracking />} />
      <Route path="/store/:slug/my-orders" element={<MyOrders />} />

      {/* Admin */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/orders"
        element={
          <ProtectedRoute>
            <OrdersBoard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/products"
        element={
          <ProtectedRoute>
            <ProductManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/categories"
        element={
          <ProtectedRoute>
            <CategoryManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/options"
        element={
          <ProtectedRoute>
            <OptionGroupManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <ProtectedRoute>
            <StoreSettings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/payment"
        element={
          <ProtectedRoute>
            <PaymentSettings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/qr"
        element={
          <ProtectedRoute>
            <QRDownload />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>
);

export default App;

import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import HomePage from './pages/HomePage.jsx';
import PostDetailPage from './pages/PostDetailPage.jsx';
import PostsPage from './pages/PostsPage.jsx';
import ProductsPage from './pages/ProductsPage.jsx';
import ProductDetailPage from './pages/ProductDetailPage.jsx';
import SearchPage from './pages/SearchPage.jsx';
import PostComposer from './components/PostComposer.jsx';
import MyPostsPage from './pages/MyPostsPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import VerifyEmailPage from './pages/VerifyEmailPage.jsx';
import BootstrapAdminPage from './pages/BootstrapAdminPage.jsx';
import AdminLayout from './admin/AdminLayout.jsx';
import AdminDashboardPage from './admin/pages/AdminDashboardPage.jsx';
import AdminUsersPage from './admin/pages/AdminUsersPage.jsx';
import AdminPostsPage from './admin/pages/AdminPostsPage.jsx';
import AdminProductsPage from './admin/pages/AdminProductsPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="posts" element={<PostsPage />} />
          <Route path="posts/:slug" element={<PostDetailPage />} />
          <Route path="create-post" element={<PostComposer />} />
          <Route path="my-posts" element={<MyPostsPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="products/:slug" element={<ProductDetailPage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="verify-email" element={<VerifyEmailPage />} />
          <Route path="bootstrap-admin" element={<BootstrapAdminPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
        <Route path="admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="posts" element={<AdminPostsPage />} />
          <Route path="products" element={<AdminProductsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;

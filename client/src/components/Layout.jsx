import { Outlet } from 'react-router-dom';
import Footer from './Footer.jsx';
import Header from './Header.jsx';

const Layout = () => {
  return (
    <div className="min-h-screen bg-background text-body">
      <Header />
      <main className="py-10 sm:py-12">
        <div className="w-full space-y-10 px-6 sm:px-10">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Layout;

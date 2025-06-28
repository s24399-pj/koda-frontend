import { Route, Routes } from 'react-router-dom';
import HomePage from '../pages/Home/HomePage';
import Offer from '../pages/Offer/Offer';
import LoginPage from '../pages/Auth/LoginPage.tsx';
import RegisterPage from '../pages/Auth/RegisterPage.tsx';
import OfferList from '../pages/OfferList/OfferList';
import NotFound from '../pages/NotFound/NotFound';
import UserPanel from '../pages/UserPanel/UserPanel.tsx';
import OfferComparison from '../pages/OfferComparison/OfferComparison.tsx';
import WhyUs from '../pages/WhyUs/WhyUs.tsx';
import OfferCreation from '../pages/OfferCreation/OfferCreation.tsx';
import ChatPage from '../pages/Chat/ChatPage.tsx';
import LikedOffers from '../pages/LikedOffers/LikedOffers.tsx';
import SellerOffers from '../pages/SellerOffers/SellerOffers.tsx';
import RequireAuth from '../components/RequireAuth/RequireAuth.tsx';

const AppRouter = () => {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<HomePage />} />
      <Route path="*" element={<NotFound />} />
      <Route path="/offers" element={<OfferList />} />
      <Route path="/offer/:id" element={<Offer />} />
      <Route path="/seller/:sellerId/offers" element={<SellerOffers />} />
      <Route path="comparison" element={<OfferComparison />} />
      <Route path="/whyus" element={<WhyUs />} />
      <Route path="/user/login" element={<LoginPage />} />
      <Route path="/user/register" element={<RegisterPage />} />
      <Route path="/liked" element={<LikedOffers />} />
      {/* Protected */}
      <Route
        path="/user/panel"
        element={
          <RequireAuth>
            <UserPanel />
          </RequireAuth>
        }
      />
      <Route
        path="/offer/create"
        element={
          <RequireAuth>
            <OfferCreation />
          </RequireAuth>
        }
      />
      <Route path="/chat" element={<ChatPage />} />
      <Route path="/chat/:recipientId" element={<ChatPage />} />
    </Routes>
  );
};

export default AppRouter;

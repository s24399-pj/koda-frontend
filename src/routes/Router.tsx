import { Routes, Route } from "react-router-dom";
import HomePage from "../pages/Home/HomePage";
import Offer from "../pages/Offer/Offer";
import LoginPage from "../pages/Auth/LoginPage.tsx";
import RegisterPage from "../pages/Auth/RegisterPage.tsx";
import OfferList from "../pages/OfferList/OfferList";
import NotFound from "../pages/NotFound/NotFound";
import UserPanel from "../pages/UserPanel/UserPanel.tsx";
import OfferComparison from "../pages/OfferComparison/OfferComparison.tsx";
import WhyUs from "../pages/WhyUs/WhyUs.tsx";
import OfferCreation from "../pages/OfferCreation/OfferCreation.tsx";
import LikedOffers from "../pages/LikedOffers/LikedOffers.tsx";
likedOfferFE

import RequireAuth from "../components/RequireAuth/RequireAuth.tsx";
main

const AppRouter = () => {
    return (
        <Routes>
            {/* Publiczne ścieżki */}
            <Route path="/" element={<HomePage />} />
            <Route path="*" element={<NotFound />} />
            <Route path="/offers" element={<OfferList />} />
            <Route path="/offer/:id" element={<Offer />} />
            <Route path="comparison" element={<OfferComparison />} />
            <Route path="/whyus" element={<WhyUs />} />
            <Route path="/user/login" element={<LoginPage />} />
            <Route path="/user/register" element={<RegisterPage />} />
likedOfferFE

            <Route path="/user/panel" element={<UserPanel />} />
            <Route path="/offer/create" element={<OfferCreation />} />

            <Route path="/liked" element={<LikedOffers />} />
            
            {/* Chronione ścieżki (z wyświetleniem AuthRequiredPage) */}
            <Route path="/user/panel" element={
                <RequireAuth>
                    <UserPanel />
                </RequireAuth>
            } />
            <Route path="/offer/create" element={
                <RequireAuth>
                    <OfferCreation />
                </RequireAuth>
            } />
main
        </Routes>
    );
};

export default AppRouter;
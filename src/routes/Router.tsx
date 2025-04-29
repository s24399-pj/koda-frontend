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
import LikedOffers from "../pages/LikedOffers/likedOffers.tsx";

const AppRouter = () => {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="*" element={<NotFound />} />
            <Route path="/offers" element={<OfferList />} />
            <Route path="/offer/:id" element={<Offer />} />
            <Route path="comparison" element={<OfferComparison />} />
            <Route path="/whyus" element={<WhyUs />} />
            <Route path="/liked" element={<LikedOffers />} />
            <Route path="/user/login" element={<LoginPage />} />
            <Route path="/user/register" element={<RegisterPage />} />

            {/* Private routes - we need to validate on the FE if user is authenticated before launching this component*/}
            <Route path="/user/panel" element={<UserPanel />} />
            <Route path="/offer/create" element={<OfferCreation />} />
        </Routes>
    );
};

export default AppRouter;
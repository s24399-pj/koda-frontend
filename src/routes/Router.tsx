import { Routes, Route } from "react-router-dom";
import HomePage from "../pages/Home/HomePage";
import Offer from "../pages/Offer/Offer";
import LoginPage from "../pages/Auth/LoginPage.tsx";
import RegisterPage from "../pages/Auth/RegisterPage.tsx";
import OfferList from "../pages/OfferList/OfferList";
import NotFound from "../pages/NotFound/NotFound";
import OfferComparison from "../pages/OfferComparison/OfferComparison.tsx";

const AppRouter = () => {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="*" element={<NotFound />} />
            <Route path="/offers" element={<OfferList />} />
            <Route path="/offer/:id" element={<Offer />} />
            <Route path="comparison" element={<OfferComparison />} />
            <Route path="/user/login" element={<LoginPage />} />
            <Route path="/user/register" element={<RegisterPage />} />
        </Routes>
    );
};

export default AppRouter;
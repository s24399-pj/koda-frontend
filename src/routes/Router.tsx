import { Routes, Route } from "react-router-dom";
import HomePage from "../pages/Home/HomePage";
import Offer from "../pages/Offer/Offer";
import OfferList from "../pages/OfferList/OfferList";
import NotFound from "../pages/NotFound/NotFound";

const AppRouter = () => {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="*" element={<NotFound />} />
            <Route path="/offers" element={<OfferList />} />
            <Route path="/offer/:id" element={<Offer />} />
        </Routes>
    );
};

export default AppRouter;
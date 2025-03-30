import { Routes, Route } from "react-router-dom";
import HomePage from "../pages/Home/HomePage";
import Offer from "../pages/Offer/Offer";
import NotFound from "../pages/NotFound/NotFound";

const AppRouter = () => {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="*" element={<NotFound />} />
            <Route path="/offer/:id" element={<Offer />} />
        </Routes>
    );
};

export default AppRouter;
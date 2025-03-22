import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "../pages/Home/HomePage";
import Offer from "../pages/Offer/Offer";

const AppRouter = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/offer/:id" element={<Offer />} />
            </Routes>
        </Router>
    );
};
       
export default AppRouter;
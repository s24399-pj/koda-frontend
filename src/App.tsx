import { BrowserRouter as Router } from "react-router-dom";
import Footer from "./components/Footer/Footer";
import Navbar from "./components/Navbar/Navbar";
import AppRouter from "./routes/Router";

function App() {
  return (
    <Router>
      <Navbar />
      <AppRouter />
      <Footer />
    </Router>
  );
}

export default App;
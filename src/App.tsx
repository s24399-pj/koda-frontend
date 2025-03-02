import Footer from "./components/Footer/Footer";
import Navbar from "./components/Navbar/Navbar";
import AppRouter from "./routes/Router";

function App() {
  return (
    <div>
      <Navbar />
      <AppRouter />
      <Footer />
    </div>
  );
}

export default App;

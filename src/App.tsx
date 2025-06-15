import { BrowserRouter as Router } from 'react-router-dom';
import Footer from './components/Footer/Footer';
import Navbar from './components/Navbar/Navbar';
import AppRouter from './routes/Router';
import Provider from './util/Providers.tsx';
import './styles/global.scss';

function App() {
  return (
    <Router>
      <Provider>
        <Navbar />
        <AppRouter />
        <Footer />
      </Provider>
    </Router>
  );
}

export default App;

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import SingleJosiyam from './pages/SingleJosiyam';
import CoupleJosiyam from './pages/CoupleJosiyam';
import Result from './pages/Result';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/single-josiyam" element={<SingleJosiyam />} />
            <Route path="/couple-josiyam" element={<CoupleJosiyam />} />
            <Route path="/result" element={<Result />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;

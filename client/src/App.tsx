import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import SingleJosiyam from './pages/SingleJosiyam';
import CoupleJosiyam from './pages/CoupleJosiyam';
import Result from './pages/Result';
import Calculator from './pages/Calculator';
import Chat from './pages/Chat';
import DailyHoroscope from './pages/DailyHoroscope';
import DailyDosDonts from './pages/DailyDosDonts';
import TamilCalendar from './pages/TamilCalendar';

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
            <Route path="/calculator" element={<Calculator />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/daily-horoscope" element={<DailyHoroscope />} />
            <Route path="/daily-dos-donts" element={<DailyDosDonts />} />
            <Route path="/tamil-calendar" element={<TamilCalendar />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;

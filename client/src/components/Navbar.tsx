import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-primary text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <h1 className="text-2xl font-heading font-bold">Smart Josiyam AI</h1>
          </Link>
          <div className="flex items-center space-x-6">
            <Link to="/calculator" className="text-sm hover:text-accent transition-colors font-semibold">
              Calculator
            </Link>
            <Link to="/chat" className="text-sm hover:text-accent transition-colors font-semibold">
              Chat
            </Link>
            <Link to="/daily-horoscope" className="text-sm hover:text-accent transition-colors font-semibold">
              Daily Horoscope
            </Link>
            <Link to="/daily-dos-donts" className="text-sm hover:text-accent transition-colors font-semibold">
              Do's & Don'ts
            </Link>
            <Link to="/tamil-calendar" className="text-sm hover:text-accent transition-colors font-semibold">
              Tamil Calendar
            </Link>
            <p className="text-sm text-secondary italic hidden md:block">Traditional Tamil Astrology with Modern AI</p>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

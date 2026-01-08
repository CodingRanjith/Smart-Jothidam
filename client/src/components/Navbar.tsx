import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-primary text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <h1 className="text-2xl font-heading font-bold">Smart Josiyam AI</h1>
          </Link>
          <p className="text-sm text-secondary italic">Traditional Tamil Astrology with Modern AI</p>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

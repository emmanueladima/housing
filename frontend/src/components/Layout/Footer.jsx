import { Link } from 'react-router-dom';
import { FiInstagram } from 'react-icons/fi';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black/30 backdrop-blur-xl text-gray-200 mt-auto border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <img src="/favicon.png" alt="Collegio Logo" className="w-8 h-8 rounded-full" />
              <span className="text-2xl text-white" style={{ fontFamily: "'Archivo Black', sans-serif" }}>collegio</span>
            </div>
            <p className="text-sm">
              Making College Easier
            </p>
            <div className="flex space-x-4 mt-4">
              <a href="https://www.instagram.com/collegio.us/" target="_blank" rel="noopener noreferrer" className="hover:text-orange-400 transition-colors">
                <FiInstagram size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/listings" className="hover:text-orange-400 transition-colors">
                  Browse Listings
                </Link>
              </li>
              <li>
                <Link to="/roommates" className="hover:text-orange-400 transition-colors">
                  Find Roommates
                </Link>
              </li>
              <li>
                <Link to="/safety" className="hover:text-orange-400 transition-colors">
                  Safety Tips
                </Link>
              </li>
            </ul>
          </div>

          {/* For Landlords */}
          <div>
            <h4 className="text-white font-semibold mb-4">For Landlords</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/landlord/dashboard" className="hover:text-orange-400 transition-colors">
                  Post a Listing
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-orange-400 transition-colors">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-orange-400 transition-colors">
                  Resources
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-orange-400 transition-colors">
                  Support
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/terms" className="hover:text-orange-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-orange-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="hover:text-orange-400 transition-colors">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <a href="mailto:admin@collegio.us" className="hover:text-orange-400 transition-colors">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 mt-8 pt-8 text-sm text-center">
          <p>&copy; {currentYear} collegio. All rights reserved.</p>
          <p className="mt-2">
            Made with ❤️ for college students
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;


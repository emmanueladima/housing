import { Link } from 'react-router-dom';
import { FiHome, FiFacebook, FiTwitter, FiInstagram, FiLinkedin } from 'react-icons/fi';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <FiHome className="text-primary-600" size={28} />
              <span className="text-2xl text-white" style={{ fontFamily: "'Archivo Black', sans-serif" }}>collegio</span>
            </div>
            <p className="text-sm">
              Making student housing search easy and connecting students with their perfect roommates.
            </p>
            <div className="flex space-x-4 mt-4">
              <a href="#" className="hover:text-primary-500 transition-colors">
                <FiFacebook size={20} />
              </a>
              <a href="#" className="hover:text-primary-500 transition-colors">
                <FiTwitter size={20} />
              </a>
              <a href="#" className="hover:text-primary-500 transition-colors">
                <FiInstagram size={20} />
              </a>
              <a href="#" className="hover:text-primary-500 transition-colors">
                <FiLinkedin size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/listings" className="hover:text-primary-500 transition-colors">
                  Browse Listings
                </Link>
              </li>
              <li>
                <Link to="/roommates" className="hover:text-primary-500 transition-colors">
                  Find Roommates
                </Link>
              </li>
              <li>
                <Link to="/safety" className="hover:text-primary-500 transition-colors">
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
                <Link to="/landlord/dashboard" className="hover:text-primary-500 transition-colors">
                  Post a Listing
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-primary-500 transition-colors">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-500 transition-colors">
                  Resources
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-500 transition-colors">
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
                <Link to="/terms" className="hover:text-primary-500 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-primary-500 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="hover:text-primary-500 transition-colors">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <a href="mailto:support@collegio.us" className="hover:text-primary-500 transition-colors">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
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


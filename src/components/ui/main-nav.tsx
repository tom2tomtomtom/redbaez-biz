import { Link } from "react-router-dom";

export function MainNav() {
  return (
    <nav className="flex items-center space-x-8 bg-white border-b px-8 py-4">
      <Link
        to="/"
        className="text-base font-semibold text-gray-900 hover:text-primary"
      >
        Overview
      </Link>
      <Link
        to="/marketing"
        className="text-base text-gray-600 hover:text-primary"
      >
        Marketing
      </Link>
      <Link
        to="/partnerships"
        className="text-base text-gray-600 hover:text-primary"
      >
        Partnerships
      </Link>
      <Link
        to="/product-development"
        className="text-base text-gray-600 hover:text-primary"
      >
        Product Development
      </Link>
      <div className="flex-grow"></div>
      <Link
        to="/ai-news"
        className="text-base text-gray-600 hover:text-primary"
      >
        AI News
      </Link>
    </nav>
  );
}
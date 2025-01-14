import { Link } from "react-router-dom";

export function MainNav() {
  return (
    <nav className="flex items-center gap-2 md:gap-6 bg-white border-b px-2 md:px-6 py-3 overflow-x-auto">
      <Link
        to="/"
        className="text-sm md:text-base font-semibold text-gray-900 hover:text-primary whitespace-nowrap transition-colors"
      >
        Overview
      </Link>
      <Link
        to="/marketing"
        className="text-sm md:text-base text-gray-600 hover:text-primary whitespace-nowrap transition-colors"
      >
        Marketing
      </Link>
      <Link
        to="/partnerships"
        className="text-sm md:text-base text-gray-600 hover:text-primary whitespace-nowrap transition-colors"
      >
        Partnerships
      </Link>
      <Link
        to="/product-development"
        className="text-sm md:text-base text-gray-600 hover:text-primary whitespace-nowrap transition-colors"
      >
        Product Development
      </Link>
      <Link
        to="/business-admin"
        className="text-sm md:text-base text-gray-600 hover:text-primary whitespace-nowrap transition-colors"
      >
        Business Admin
      </Link>
      <div className="flex-grow"></div>
      <Link
        to="/ai-news"
        className="text-sm md:text-base text-gray-600 hover:text-primary whitespace-nowrap transition-colors"
      >
        AI News
      </Link>
    </nav>
  );
}
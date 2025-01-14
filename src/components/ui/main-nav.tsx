import { Link } from "react-router-dom";

export function MainNav() {
  return (
    <nav className="flex items-center gap-4 md:gap-8 bg-white border-b px-4 md:px-8 py-4 overflow-x-auto">
      <Link
        to="/"
        className="text-sm md:text-base font-semibold text-gray-900 hover:text-primary whitespace-nowrap"
      >
        Overview
      </Link>
      <Link
        to="/marketing"
        className="text-sm md:text-base text-gray-600 hover:text-primary whitespace-nowrap"
      >
        Marketing
      </Link>
      <Link
        to="/partnerships"
        className="text-sm md:text-base text-gray-600 hover:text-primary whitespace-nowrap"
      >
        Partnerships
      </Link>
      <Link
        to="/product-development"
        className="text-sm md:text-base text-gray-600 hover:text-primary whitespace-nowrap"
      >
        Product Development
      </Link>
      <Link
        to="/business-admin"
        className="text-sm md:text-base text-gray-600 hover:text-primary whitespace-nowrap"
      >
        Business Admin
      </Link>
      <div className="flex-grow"></div>
      <Link
        to="/ai-news"
        className="text-sm md:text-base text-gray-600 hover:text-primary whitespace-nowrap"
      >
        AI News
      </Link>
    </nav>
  );
}
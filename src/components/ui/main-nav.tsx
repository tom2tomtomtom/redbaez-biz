import { Link } from "react-router-dom";

export function MainNav() {
  return (
    <div className="flex items-center space-x-4 lg:space-x-6 bg-white border-b px-4 py-2">
      <Link
        to="/"
        className="text-sm font-medium transition-colors hover:text-primary"
      >
        Overview
      </Link>
      <Link
        to="/marketing"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        Marketing
      </Link>
      <Link
        to="/product-development"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        Product Development
      </Link>
      <Link
        to="/partnerships"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        Partnerships
      </Link>
      <Link
        to="/business-admin"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        Business Admin
      </Link>
      <div className="flex-grow"></div>
      <Link
        to="/ai-news"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        AI News
      </Link>
    </div>
  );
}
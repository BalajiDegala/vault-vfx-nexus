
import { Link } from "react-router-dom";

interface UserPortfolioLinkProps {
  userId: string;
  className?: string;
}

export function UserPortfolioLink({ userId, className = "" }: UserPortfolioLinkProps) {
  return (
    <Link to={`/portfolio?user=${userId}`} className={`text-blue-400 underline ${className}`}>
      View Portfolio
    </Link>
  );
}

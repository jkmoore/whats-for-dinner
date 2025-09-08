import { Link } from "react-router-dom";
import { User } from "firebase/auth";
import { auth } from "services/firebase";

export default function NotFound() {
  const user: User | null = auth.currentUser;

  return (
    <div>
      <h1>This page was not found.</h1>
      <p>
        {user ? (
          <Link to="/inventory">Return to inventory</Link>
        ) : (
          <>
            <Link to="/login">Login</Link> or <Link to="/signup">Signup</Link>
          </>
        )}
      </p>
    </div>
  );
}

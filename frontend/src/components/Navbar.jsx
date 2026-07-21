import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/");
    window.location.reload();
  };

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.logo}>
         PintPoint Dublin
      </Link>

      <div style={styles.links}>
        <Link to="/" style={styles.link}>
          Home
        </Link>

        {user ? (
          <>
            <span style={styles.welcome}>
              Welcome, {user.first_name}
            </span>

            <button onClick={handleLogout} style={styles.button}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={styles.link}>
              Login
            </Link>

            <Link to="/register" style={styles.link}>
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    backgroundColor: "#222",
    color: "white",
    padding: "15px 40px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  logo: {
    color: "white",
    textDecoration: "none",
    fontWeight: "bold",
    fontSize: "22px",
  },

  links: {
    display: "flex",
    gap: "20px",
    alignItems: "center",
  },

  link: {
    color: "white",
    textDecoration: "none",
  },

  welcome: {
    fontWeight: "bold",
  },

  button: {
    background: "#d62828",
    color: "white",
    border: "none",
    padding: "8px 16px",
    borderRadius: "5px",
    cursor: "pointer",
  },
};

export default Navbar;
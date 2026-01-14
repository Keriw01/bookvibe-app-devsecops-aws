import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { MDBContainer, MDBInput, MDBBtn } from "mdb-react-ui-kit";

const Login = () => {
  const { isAuthenticated } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  });

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Email jest wymagany");
      return;
    }

    if (!validateEmail(email)) {
      setError("Proszę podać prawidłowy adres email");
      return;
    }

    if (!password) {
      setError("Hasło jest wymagane");
      return;
    }

    if (password.length < 8) {
      setError("Hasło musi mieć co najmniej 8 znaków");
      return;
    }

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError("Błędne dane logowania");
    }
  };

  return (
    <MDBContainer className="p-3 my-5 d-flex flex-column w-25">
      <h2 className="text-2xl mb-4 text-center">Logowanie</h2>

      {error && <div className="alert alert-danger mb-4">{error}</div>}

      <form onSubmit={handleSubmit}>
        <MDBInput
          wrapperClass="mb-4"
          label="Email"
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <MDBInput
          wrapperClass="mb-4"
          label="Hasło"
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <div className="d-flex justify-content-end mx-3 mb-4">
          <Link to="/forgot-password">Zapomniałeś hasła?</Link>
        </div>

        <MDBBtn type="submit" className="mb-4" block>
          Zaloguj się
        </MDBBtn>

        <div className="text-center">
          <p>
            Nie masz konta? <Link to="/register">Zarejestruj się</Link>
          </p>
        </div>
      </form>
    </MDBContainer>
  );
};

export default Login;

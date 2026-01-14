import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { MDBContainer, MDBInput, MDBBtn } from "mdb-react-ui-kit";

const Register = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const { register } = useAuth();
  const navigate = useNavigate();

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePassword = (password: string) => {
    const re = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).*$/;
    return re.test(password);
  };

  const validateName = (name: string) => {
    const re = /^[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ .'-]+$/;
    return re.test(name);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!fullName) {
      setError("Imię i nazwisko jest wymagane");
      return;
    }

    if (fullName.length < 3 || fullName.length > 100) {
      setError("Imię i nazwisko musi mieć od 3 do 100 znaków");
      return;
    }

    if (!validateName(fullName)) {
      setError(
        "Imię i nazwisko może zawierać tylko litery, spacje oraz znaki .'-'"
      );
      return;
    }

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

    if (!validatePassword(password)) {
      setError(
        "Hasło musi zawierać co najmniej jedną cyfrę, jedną małą literę i jedną wielką literę"
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Hasła nie są identyczne");
      return;
    }

    try {
      await register(email, password, fullName);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Błąd rejestracji");
    }
  };

  return (
    <MDBContainer className="p-3 my-5 d-flex flex-column w-25">
      <h2 className="text-2xl mb-4 text-center">Rejestracja</h2>

      {error && <div className="alert alert-danger mb-4">{error}</div>}

      <form onSubmit={handleSubmit}>
        <MDBInput
          wrapperClass="mb-4"
          label="Imię i nazwisko"
          id="fullName"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />

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
        <div className="mb-4 text-muted small">
          Hasło musi mieć co najmniej 8 znaków i zawierać cyfrę, małą i wielką
          literę
        </div>

        <MDBInput
          wrapperClass="mb-4"
          label="Potwierdź hasło"
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <MDBBtn type="submit" color="success" className="mb-4" block>
          Zarejestruj się
        </MDBBtn>

        <div className="text-center">
          <p>
            Masz już konto?
            <Link to="/login" className="text-primary ml-2">
              Zaloguj się
            </Link>
          </p>
        </div>
      </form>
    </MDBContainer>
  );
};

export default Register;

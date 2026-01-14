import React from "react";
import { useAuth } from "../context/AuthContext";
import { MDBContainer, MDBSpinner } from "mdb-react-ui-kit";
import DashboardHeader from "./dashboard/DashboardHeader";

import UserBookList from "./dashboard/UserBookList";
import AdminBookPanel from "./admin/AdminBookPanel";
import FavouriteBooksCarousel from "./dashboard/FavouriteBooksCarousel";

function Dashboard() {
  const { user, isLoading, logout, hasRole } = useAuth();

  if (isLoading || !user) {
    return (
      <MDBContainer className="my-5 text-center">
        <MDBSpinner role="status">
          <span className="visually-hidden">Loading...</span>
        </MDBSpinner>
      </MDBContainer>
    );
  }

  return (
    <MDBContainer className="my-5">
      <DashboardHeader user={user} logout={logout} hasRole={hasRole} />
      {hasRole("USER") ? <FavouriteBooksCarousel /> : <div />}
      <hr className="my-4" />
      {hasRole("MODERATOR") ? <AdminBookPanel /> : <UserBookList />}
    </MDBContainer>
  );
}

export default Dashboard;

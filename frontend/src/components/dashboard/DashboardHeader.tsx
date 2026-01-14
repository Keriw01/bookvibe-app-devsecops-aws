import React from "react";
import {
  MDBDropdown,
  MDBDropdownToggle,
  MDBDropdownMenu,
  MDBDropdownItem,
} from "mdb-react-ui-kit";
import { UserDto } from "../../dtos/UserDto";

interface DashboardHeaderProps {
  user: UserDto;
  logout: () => void;
  hasRole: (roleName: string) => boolean;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  user,
  logout,
  hasRole,
}) => {
  return (
    <div className="d-flex justify-content-between align-items-center mb-4">
      <h1 className="mb-0">Witaj, {user.fullName}! (v1.0.4)</h1>
      <MDBDropdown>
        <MDBDropdownToggle color="primary" className="me-1" caret>
          Menu
        </MDBDropdownToggle>
        <MDBDropdownMenu>
          <MDBDropdownItem link href="/profile">
            Profil
          </MDBDropdownItem>
          {hasRole("MODERATOR") ? (
            <MDBDropdownItem link href="/admin/users">
              Zarządzaj użytkownikami
            </MDBDropdownItem>
          ) : (
            <></>
          )}
          <MDBDropdownItem divider />
          <MDBDropdownItem link onClick={logout}>
            Wyloguj
          </MDBDropdownItem>
        </MDBDropdownMenu>
      </MDBDropdown>
    </div>
  );
};

export default DashboardHeader;

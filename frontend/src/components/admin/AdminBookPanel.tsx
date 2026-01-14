import React from "react";
import {
  MDBContainer,
  MDBCard,
  MDBCardBody,
  MDBTabs,
  MDBTabsItem,
  MDBTabsLink,
} from "mdb-react-ui-kit";
import ManageCollections from "./ManageCollections";
import ManageBooks from "./ManageBooks";
import { useState } from "react";

const AdminBookPanel = () => {
  const [activeTab, setActiveTab] = useState("collections");

  const handleTabClick = (value: string) => {
    if (value === activeTab) {
      return;
    }
    setActiveTab(value);
  };

  return (
    <MDBContainer>
      <MDBCard>
        <MDBCardBody>
          <h2>Panel Moderatora</h2>

          <MDBTabs fill className="mb-3">
            <MDBTabsItem>
              <MDBTabsLink
                onClick={() => handleTabClick("collections")}
                active={activeTab === "collections"}
              >
                Zarządzaj Kolekcjami
              </MDBTabsLink>
            </MDBTabsItem>
            <MDBTabsItem>
              <MDBTabsLink
                onClick={() => handleTabClick("books")}
                active={activeTab === "books"}
              >
                Zarządzaj Książkami
              </MDBTabsLink>
            </MDBTabsItem>
          </MDBTabs>

          <div className="mt-3">
            {activeTab === "collections" && <ManageCollections />}
            {activeTab === "books" && <ManageBooks />}
          </div>
        </MDBCardBody>
      </MDBCard>
    </MDBContainer>
  );
};

export default AdminBookPanel;

"use client";

import ApproveDeal from "../components/ApproveDeal";
import CreateDeal from "../components/CreateDeal";
import RefundDeal from "../components/RefundDeal";

function Home() {
  return (
    <div>
      <CreateDeal />
      <ApproveDeal />
      <RefundDeal />
    </div>
  );
}

export default Home;

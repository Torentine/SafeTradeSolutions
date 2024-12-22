import { useState } from "react";
import "../styles/components.css";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

const ApproveDeal = () => {
  const [dealId, setDealId] = useState("");

  const { writeContractAsync: approveDeal } = useScaffoldWriteContract({
    contractName: "Escrow",
  });

  const handleApprove = async () => {
    if (!dealId) {
      alert("Please provide a deal ID");
      return;
    }
    try {
      await approveDeal({
        functionName: "approve",
        args: [BigInt(dealId)],
      });
      alert("Deal approved successfully!");
    } catch (error: any) {
      alert("Error approving deal: " + error.message);
    }
  };

  return (
    <div className="card">
      <h2>Approve Escrow Deal</h2>
      <div className="inputGroup">
        <input type="number" placeholder="Enter deal ID" value={dealId} onChange={e => setDealId(e.target.value)} />
      </div>
      <button onClick={handleApprove}>Approve Deal</button>
    </div>
  );
};

export default ApproveDeal;

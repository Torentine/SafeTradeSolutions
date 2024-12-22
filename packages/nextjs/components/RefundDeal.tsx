import { useState } from "react";
import "../styles/components.css";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

const RefundDeal = () => {
  const [dealId, setDealId] = useState("");

  const { writeContractAsync: refundDeal } = useScaffoldWriteContract({
    contractName: "Escrow",
  });

  const handleRefund = async () => {
    if (!dealId) {
      alert("Please provide a deal ID");
      return;
    }
    try {
      await refundDeal({
        functionName: "refund",
        args: [BigInt(dealId)],
      });
      alert("Deal refunded successfully!");
    } catch (error: any) {
      alert("Error refunding deal: " + error.message);
    }
  };

  return (
    <div className="card">
      <h2>Refund Escrow Deal</h2>
      <div className="inputGroup">
        <input type="number" placeholder="Enter deal ID" value={dealId} onChange={e => setDealId(e.target.value)} />
      </div>
      <button onClick={handleRefund}>Refund Deal</button>
    </div>
  );
};

export default RefundDeal;

import { useState } from "react";
import "../styles/components.css";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

const CreateDeal = () => {
  const [payee, setPayee] = useState("");
  const [arbiter, setArbiter] = useState("");
  const [amount, setAmount] = useState("");

  const { writeContractAsync: createDeal } = useScaffoldWriteContract({
    contractName: "Escrow",
  });

  const handleCreateDeal = async () => {
    if (!payee || !arbiter || !amount) {
      alert("Please fill in all fields");
      return;
    }
    try {
      await createDeal({
        functionName: "createDeal",
        args: [payee, arbiter],
        value: BigInt(amount ? amount : 0),
      });
      alert("Deal created successfully!");
    } catch (error: any) {
      alert("Error creating deal: " + error.message);
    }
  };

  return (
    <div className="card">
      <h2>Create an Escrow Deal</h2>
      <div className="inputGroup">
        <label>Payee Address</label>
        <input type="text" placeholder="Enter payee address" value={payee} onChange={e => setPayee(e.target.value)} />
      </div>
      <div className="inputGroup">
        <label>Arbiter Address</label>
        <input
          type="text"
          placeholder="Enter arbiter address"
          value={arbiter}
          onChange={e => setArbiter(e.target.value)}
        />
      </div>
      <div className="inputGroup">
        <label>Amount (ETH)</label>
        <input
          type="number"
          placeholder="Enter amount in ETH"
          value={amount}
          onChange={e => setAmount(e.target.value)}
        />
      </div>
      <button onClick={handleCreateDeal}>Create Deal</button>
    </div>
  );
};

export default CreateDeal;

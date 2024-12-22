import { expect } from "chai";
import { ethers } from "hardhat";
import { Escrow } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("Testing the Escrow Contract", function () {
  let escrow: Escrow;
  let payer: HardhatEthersSigner;
  let payee: HardhatEthersSigner;
  let arbiter: HardhatEthersSigner;
  let otherUser: HardhatEthersSigner;

  beforeEach(async function () {
    // Get the signers (addresses)
    [payer, payee, arbiter, otherUser] = await ethers.getSigners();

    // Deploy the Escrow contract
    const yourContractFactory = await ethers.getContractFactory("Escrow");
    escrow = (await yourContractFactory.deploy()) as Escrow;
    await escrow.waitForDeployment();
  });

  describe("createDeal", function () {
    it("should create a new deal successfully", async function () {
      const amount = ethers.parseEther("1.0"); // 1 ETH
      await expect(escrow.connect(payer).createDeal(payee.address, arbiter.address, { value: amount }))
        .to.emit(escrow, "Deposit")
        .withArgs(1, payer.address, amount);

      const deal = await escrow.deals(1);
      expect(deal.payer).to.equal(payer.address);
      expect(deal.payee).to.equal(payee.address);
      expect(deal.arbiter).to.equal(arbiter.address);
      expect(deal.amount).to.equal(amount);
      expect(deal.status).to.equal(0); // Status.Pending
    });

    it("should fail if deposit amount is zero", async function () {
      await expect(escrow.connect(payer).createDeal(payee.address, arbiter.address, { value: 0 })).to.be.revertedWith(
        "Deposit amount must be greater than 0",
      );
    });

    it("should fail if payee or arbiter address is invalid", async function () {
      const amount = ethers.parseEther("1.0");
      await expect(
        escrow.connect(payer).createDeal(ethers.ZeroAddress, arbiter.address, { value: amount }),
      ).to.be.revertedWith("Invalid address");

      await expect(
        escrow.connect(payer).createDeal(payee.address, ethers.ZeroAddress, { value: amount }),
      ).to.be.revertedWith("Invalid address");
    });
  });

  describe("approve", function () {
    it("should release funds to the payee", async function () {
      const amount = ethers.parseEther("1.0");
      await escrow.connect(payer).createDeal(payee.address, arbiter.address, { value: amount });

      await expect(escrow.connect(arbiter).approve(1)).to.emit(escrow, "Release").withArgs(1, payee.address, amount);

      const payeeBalanceAfter = await ethers.provider.getBalance(payee.address);
      expect(payeeBalanceAfter).to.be.above(amount); // Payee should receive funds
    });

    it("should fail if the caller is not the arbiter", async function () {
      await escrow.connect(payer).createDeal(payee.address, arbiter.address, { value: ethers.parseEther("1.0") });
      await expect(escrow.connect(otherUser).approve(1)).to.be.revertedWith("Only arbiter can call this function");
    });

    it("should fail if the deal is not pending", async function () {
      await escrow.connect(payer).createDeal(payee.address, arbiter.address, { value: ethers.parseEther("1.0") });
      await escrow.connect(arbiter).approve(1); // Release the funds first
      await expect(escrow.connect(arbiter).approve(1)).to.be.revertedWith("Transaction already completed");
    });
  });

  describe("refund", function () {
    it("should refund funds to the payer", async function () {
      const amount = ethers.parseEther("1.0");
      await escrow.connect(payer).createDeal(payee.address, arbiter.address, { value: amount });

      await expect(escrow.connect(arbiter).refund(1)).to.emit(escrow, "Refund").withArgs(1, payer.address, amount);

      const payerBalanceAfter = await ethers.provider.getBalance(payer.address);
      expect(payerBalanceAfter).to.be.above(amount); // Payer should receive refund
    });

    it("should fail if the caller is not the arbiter", async function () {
      await escrow.connect(payer).createDeal(payee.address, arbiter.address, { value: ethers.parseEther("1.0") });
      await expect(escrow.connect(otherUser).refund(1)).to.be.revertedWith("Only arbiter can call this function");
    });

    it("should fail if the deal is not pending", async function () {
      await escrow.connect(payer).createDeal(payee.address, arbiter.address, { value: ethers.parseEther("1.0") });
      await escrow.connect(arbiter).refund(1); // Refund the funds first
      await expect(escrow.connect(arbiter).refund(1)).to.be.revertedWith("Transaction already completed");
    });
  });

  describe("Edge cases", function () {
    it("should not allow multiple approvals or refunds", async function () {
      await escrow.connect(payer).createDeal(payee.address, arbiter.address, { value: ethers.parseEther("1.0") });
      await escrow.connect(arbiter).approve(1);
      await expect(escrow.connect(arbiter).approve(1)).to.be.revertedWith("Transaction already completed");

      await escrow.connect(payer).createDeal(payee.address, arbiter.address, { value: ethers.parseEther("1.0") });
      await escrow.connect(arbiter).refund(2);
      await expect(escrow.connect(arbiter).refund(2)).to.be.revertedWith("Transaction already completed");
    });
  });
});

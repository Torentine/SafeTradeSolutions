// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Escrow {
    // Events
    event Deposit(uint256 indexed dealId, address indexed payer, uint256 amount);
    event Approval(uint256 indexed dealId, address indexed approver);
    event Refund(uint256 indexed dealId, address indexed payer, uint256 amount);
    event Release(uint256 indexed dealId, address indexed payee, uint256 amount);

    enum Status { Pending, Released, Refunded }

    struct Deal {
        address payer;
        address payee;
        address arbiter;
        uint256 amount;
        Status status;
    }

    uint256 public dealCounter;
    mapping(uint256 => Deal) public deals;

    // Modifiers
    modifier onlyPayer(uint256 dealId) {
        require(msg.sender == deals[dealId].payer, "Only payer can call this function");
        _;
    }

    modifier onlyArbiter(uint256 dealId) {
        require(msg.sender == deals[dealId].arbiter, "Only arbiter can call this function");
        _;
    }

    // Create a new deal
    function createDeal(address _payee, address _arbiter) external payable {
        require(msg.value > 0, "Deposit amount must be greater than 0");
        require(_payee != address(0) && _arbiter != address(0), "Invalid address");

        dealCounter++;
        deals[dealCounter] = Deal({
            payer: msg.sender,
            payee: _payee,
            arbiter: _arbiter,
            amount: msg.value,
            status: Status.Pending
        });

        emit Deposit(dealCounter, msg.sender, msg.value);
    }

    // Approve the deal
    function approve(uint256 dealId) external onlyArbiter(dealId) {
        Deal storage deal = deals[dealId];
        require(deal.payer != address(0), "Deal does not exist");
        require(deal.status == Status.Pending, "Transaction already completed");

        deal.status = Status.Released;
        payable(deal.payee).transfer(deal.amount);

        emit Release(dealId, deal.payee, deal.amount);
    }

    // Refund funds to the payer
    function refund(uint256 dealId) external onlyArbiter(dealId) {
        Deal storage deal = deals[dealId];
        require(deal.payer != address(0), "Deal does not exist");
        require(deal.status == Status.Pending, "Transaction already completed");

        deal.status = Status.Refunded;
        payable(deal.payer).transfer(deal.amount);

        emit Refund(dealId, deal.payer, deal.amount);
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// Interface for the wrapped token contract
interface RewardToken {
    function mint(address to, uint256 amount) external;
}

contract CharityManager {
    address public immutable i_owner;
    // future integration to accept more than 1 token
    IERC20 public tokenToAcceptAddress;
    RewardToken public rewardContractAddress;

    constructor(address _tokenToAccept, address _rewardContractAddress) {
        i_owner = msg.sender;
        proposalCount = 0;
        tokenToAcceptAddress = IERC20(_tokenToAccept);
        rewardContractAddress = RewardToken(_rewardContractAddress);
    }

    modifier onlyOwner() {
        require(msg.sender == i_owner, "Only the owner can call this function");
        _;
    }

    mapping(address => uint256) public addressToDonatedTotal;
    struct Proposal {
        string proposalURL;
        uint256 amountNeeded;
        uint256 donatedSoFar;
        uint256 deadline;
        address donateToAddress;
        bool matchingDonations;
        // Stores addresses of donors and their donated amounts
        mapping(address => uint256) donations;
        address[] matchingOrg;
        mapping(address => uint256) orgActualDonated;
        mapping(address => uint256) addressMatchingAmount;
        mapping(address => uint256) addressMatchingRatio;
    }
    mapping(uint256 => Proposal) public proposals;
    uint256 public proposalCount;

    // Donating to contract and receive() to cover
    function donateWithChoice(uint256 _amount, uint256 _proposalId) public {
        /*Donates XSGD or USDC and receives a wrapped token 
        that proof of how much each individual has donated

        do not block donations over the target

        block donations less than a dollar

        dont allow proposal id that is non existent, by checking if proposal URL exists

        */
        Proposal storage proposal = proposals[_proposalId];
        // Get the current timestamp in seconds since the Unix epoch.
        uint256 currentTime = block.timestamp;
        // Check if the current time exceeds the deadline
        require(
            currentTime < proposal.deadline,
            "Proposal deadline has already passed"
        );
        // require minimum donation of a dollar
        require(_amount > 999999, "Minimum donation is $1");
        // prevent proposal URL to be empty
        require(bytes(proposal.proposalURL).length > 0, "Invalid proposal ID");
        // Transfer the specified amount of tokens from the sender to the contract
        require(
            tokenToAcceptAddress.transferFrom(
                msg.sender,
                address(proposal.donateToAddress),
                _amount
            ),
            "Token transfer failed"
        );
        // check if there is matching donations then multiply it and add _amount to it
        if (proposal.matchingDonations == true) {
            uint256 _amount_to_match = _amount;
            uint256 _matched_by_org = 0;
            for (
                uint256 orgIndex = 0;
                orgIndex < proposal.matchingOrg.length;
                orgIndex++
            ) {
                if (
                    proposal.addressMatchingAmount[
                        proposal.matchingOrg[orgIndex]
                    ] > 0
                ) {
                    // Initialize variable
                    uint256 matchingAmount = 0;
                    // multiply by ratio and remove the extra digits from multiplication
                    matchingAmount =
                        (_amount_to_match *
                            proposal.addressMatchingRatio[
                                proposal.matchingOrg[orgIndex]
                            ]) /
                        10000;
                    if (
                        matchingAmount >
                        proposal.addressMatchingAmount[
                            proposal.matchingOrg[orgIndex]
                        ]
                    ) {
                        uint256 org_match = proposal.addressMatchingAmount[
                            proposal.matchingOrg[orgIndex]
                        ];
                        // getting user amount that i am matching to reduce
                        // Probably here getting error in calculation
                        uint256 deduct_amount_to_match = (org_match /
                            proposal.addressMatchingRatio[
                                proposal.matchingOrg[orgIndex]
                            ]) * 10000;
                        _amount_to_match =
                            _amount_to_match -
                            deduct_amount_to_match;
                        _matched_by_org = proposal.addressMatchingAmount[
                            proposal.matchingOrg[orgIndex]
                        ];
                        // reduce org to 0
                        proposal.addressMatchingAmount[
                            proposal.matchingOrg[orgIndex]
                        ] = 0;
                    } else {
                        uint256 deduct_org_amount = proposal
                            .addressMatchingAmount[
                                proposal.matchingOrg[orgIndex]
                            ] - matchingAmount;
                        _matched_by_org = _matched_by_org + matchingAmount;
                        proposal.addressMatchingAmount[
                            proposal.matchingOrg[orgIndex]
                        ] = deduct_org_amount;
                        break;
                    }
                }
            }
            // clearing away since matching amt balance doesnt matter once i exit
            _amount_to_match = _amount + _matched_by_org;
            // Mint the wrapped token to the user(msg.sender)
            rewardContractAddress.mint(msg.sender, _amount_to_match);
            proposal.donatedSoFar += _amount_to_match;
        } else {
            // Mint the wrapped token to the user(msg.sender)
            rewardContractAddress.mint(msg.sender, _amount);
            proposal.donatedSoFar += _amount;
        }
        proposal.donations[msg.sender] += _amount;

        addressToDonatedTotal[msg.sender] += _amount;
    }

    // owner add proposal to contract
    function addProposal(
        string memory _proposalURL,
        uint256 _amountNeeded,
        address _donateToAddress,
        uint256 _durationInDays
    ) public onlyOwner {
        proposalCount++;
        // Convert days to seconds
        uint256 durationInSeconds = _durationInDays * 1 days;
        // Get the current timestamp in seconds since the Unix epoch.
        uint256 currentTime = block.timestamp;
        // Calculate the target time by adding the duration to the current time.
        uint256 targetTime = currentTime + durationInSeconds;
        Proposal storage newProposal = proposals[proposalCount];
        newProposal.proposalURL = _proposalURL;
        newProposal.amountNeeded = _amountNeeded;
        newProposal.deadline = targetTime;
        newProposal.donateToAddress = _donateToAddress;
        newProposal.matchingDonations = false;
    }

    // organization matching funds for specific cause
    function matchDonation(
        uint256 _proposalId,
        uint256 _amountToMatch,
        uint256 _ratioToMatch
    ) public {
        // _ratioToMatch in bips 10000 = 100% match rate 1:1
        // handle multiple organization matching, handle ratio checks to ensure no one matches more than proposed amount
        Proposal storage proposal = proposals[_proposalId];
        // prevent proposal URL to be empty
        require(bytes(proposal.proposalURL).length > 0, "Invalid proposal ID");
        // prevent 0 dollar matching, minimally $100 Matching
        require(_amountToMatch > 99999999, "Minimally $1 in matching");
        require(_ratioToMatch >= 10000, "Minimally 1:1 matching");
        // Check if addressMatchingAmount[msg.sender] has not been set
        require(
            proposal.addressMatchingAmount[msg.sender] == 0,
            "Matching amount already set"
        );
        // Transfer the specified amount of tokens from the sender to the contract
        require(
            tokenToAcceptAddress.transferFrom(
                msg.sender,
                address(proposal.donateToAddress),
                _amountToMatch
            ),
            "Token transfer failed"
        );
        proposal.matchingOrg.push(msg.sender);
        proposal.matchingDonations = true;
        proposal.addressMatchingAmount[msg.sender] = _amountToMatch;
        proposal.orgActualDonated[msg.sender] = _amountToMatch;
        proposal.addressMatchingRatio[msg.sender] = _ratioToMatch;
    }
}

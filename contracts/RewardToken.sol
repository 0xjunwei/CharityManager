// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract RewardToken is ERC20, Ownable {
    constructor() ERC20("Charity Reward Token", "rCross") {}

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    // Override the decimals function to return the desired number of decimals (e.g., 6)
    function decimals() public view override returns (uint8) {
        return 6;
    }
}

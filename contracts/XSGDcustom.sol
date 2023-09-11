// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract XSGDcustom is ERC20 {
    constructor(uint256 initialSupply) ERC20("XSGD", "XSGD") {
        _mint(msg.sender, initialSupply);
    }

    // Override the decimals function to return the desired number of decimals (e.g., 6)
    function decimals() public view override returns (uint8) {
        return 6;
    }
}

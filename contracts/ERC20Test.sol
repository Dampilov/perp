// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.7.6;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ERC20Test is ERC20 {
    constructor(
        string memory name,
        string memory symbol,
        uint8 _decimals
    ) ERC20(name, symbol) {
        _setupDecimals(_decimals);
        _mint(msg.sender, 1000000000);
    }

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

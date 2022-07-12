// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.7.6;
import { VirtualToken } from "./VirtualToken.sol";

contract QuoteToken is VirtualToken {
    function initialize(string memory nameArg, string memory symbolArg) external initializer {
        __VirtualToken_init(nameArg, symbolArg);
    }
}

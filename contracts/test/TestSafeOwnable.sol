// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.7.6;
import "../base/SafeOwnable.sol";

contract TestSafeOwnable is SafeOwnable {
    function initialize() external initializer {
        __SafeOwnable_init();
    }
}

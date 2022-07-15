import { parseEther, parseUnits } from "ethers/lib/utils"
import { task } from "hardhat/config"
import { HardhatRuntimeEnvironment } from "hardhat/types"

task("clearingHouse.openPosition")
    .addParam("contract", "Contract address")
    .addParam("basetoken", "Token address")
    .addParam("amount", "Token address")
    .setAction(async ({ contract, basetoken, amount }, hre: HardhatRuntimeEnvironment) => {
        const { ethers } = hre

        const ClearingHouseContract = (await ethers.getContractFactory("ClearingHouse")).attach(contract)

        const tx = await (
            await ClearingHouseContract.openPosition({
                baseToken: basetoken,
                isBaseToQuote: false,
                isExactInput: true,
                oppositeAmountBound: 0,
                amount: parseEther(amount),
                sqrtPriceLimitX96: 0,
                deadline: ethers.constants.MaxUint256,
                referralCode: ethers.constants.HashZero,
            })
        ).wait()

        console.log(`CleaningHouse.openPosition: ${tx.transactionHash}`)
    })

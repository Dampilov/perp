import { task } from "hardhat/config"
import { HardhatRuntimeEnvironment } from "hardhat/types"

task("clearingHouse.closePosition")
    .addParam("contract", "Contract address")
    .addParam("basetoken", "Token address")
    .setAction(async ({ contract, basetoken }, hre: HardhatRuntimeEnvironment) => {
        const { ethers } = hre

        const ClearingHouseContract = (await ethers.getContractFactory("ClearingHouse")).attach(contract)

        const tx = await (
            await ClearingHouseContract.closePosition({
                baseToken: basetoken,
                sqrtPriceLimitX96: 0,
                oppositeAmountBound: 0,
                deadline: ethers.constants.MaxUint256,
                referralCode: ethers.constants.HashZero,
            })
        ).wait()

        console.log(`CleaningHouse.closePosition: ${tx.transactionHash}`)
    })

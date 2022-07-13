import { parseEther } from "ethers/lib/utils"
import { task } from "hardhat/config"
import { HardhatRuntimeEnvironment } from "hardhat/types"

task("cleaningHouse.openPosition")
    .addParam("contract", "Contract address")
    .addParam("basetoken", "Token address")
    .setAction(async ({ contract, basetoken }, hre: HardhatRuntimeEnvironment) => {
        const { ethers } = hre

        const ClearingHouseContract = (await ethers.getContractFactory("ClearingHouse")).attach(contract)

        const tx = await (
            await ClearingHouseContract.openPosition({
                baseToken: basetoken,
                isBaseToQuote: false,
                isExactInput: true,
                oppositeAmountBound: 0,
                amount: parseEther("2"),
                sqrtPriceLimitX96: 0,
                deadline: ethers.constants.MaxUint256,
                referralCode: ethers.constants.HashZero,
            })
        ).wait()

        console.log(`CleaningHouse.openPosition: ${tx.transactionHash}`)
    })

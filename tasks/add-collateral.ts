import { parseEther } from "ethers/lib/utils"
import { task } from "hardhat/config"
import { HardhatRuntimeEnvironment } from "hardhat/types"

task("collateralManager.addCollateral")
    .addParam("contract", "Contract address")
    .addParam("token", "Token address")
    .addParam("pricefeed", "Oracle address")
    .addOptionalParam("collateralratio", "AVAX token address")
    .addOptionalParam("discountratio", "AVAX token address")
    .addParam("depositcap", "AVAX token address")
    .setAction(
        async (
            { contract, token, pricefeed, collateralratio, discountratio, depositcap },
            hre: HardhatRuntimeEnvironment,
        ) => {
            const { ethers } = hre

            const CollateralManagerContract = (await ethers.getContractFactory("CollateralManager")).attach(contract)

            const tx = await (
                await CollateralManagerContract.addCollateral(token, {
                    priceFeed: pricefeed,
                    collateralRatio: collateralratio || (0.7e6).toString(),
                    discountRatio: discountratio || (0.1e6).toString(),
                    depositCap: parseEther(depositcap.toString()),
                })
            ).wait()

            console.log(`CollateralManager.addCollateral: ${tx.transactionHash}`)
        },
    )

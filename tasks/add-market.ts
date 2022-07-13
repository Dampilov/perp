import { task } from "hardhat/config"
import { HardhatRuntimeEnvironment } from "hardhat/types"

task("market.addMarket")
    .addParam("contract", "Contract address")
    .addParam("pool", "Pool address")
    .addParam("basetoken", "Token address")
    .addParam("mintick", "AVAX token address")
    .addParam("maxtick", "AVAX token address")
    .setAction(async ({ contract, pool, basetoken, mintick, maxtick }, hre: HardhatRuntimeEnvironment) => {
        const { ethers } = hre
        const initPrice = 151.373306858723226652
        const uniFeeRatio = 10000

        const MarketRegistryContract = (await ethers.getContractFactory("MarketRegistry")).attach(contract)

        /* await hre.run("uni.initPool", {
            contract: pool,
            initprice: initPrice.toString(),
        }) */

        const exFeeRatio = 1000 // 0.1%
        const ifFeeRatio = 100000 // 10%
        //await marketRegistry.setFeeRatio(baseToken, exFeeRatio)
        //await marketRegistry.setInsuranceFundFeeRatio(baseToken, ifFeeRatio)

        const tx = await (await MarketRegistryContract.addPool(basetoken, uniFeeRatio)).wait()

        console.log(`MarketRegistry.addPool: ${tx.transactionHash}`)
    })

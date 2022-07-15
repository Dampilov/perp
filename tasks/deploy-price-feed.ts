import { task } from "hardhat/config"
import { HardhatRuntimeEnvironment } from "hardhat/types"

task("priceFeed.deploy")
    .addParam("pair", "Contract address")
    .addParam("aggregator", "Contract address")
    .setAction(async ({ pair, aggregator }, hre: HardhatRuntimeEnvironment) => {
        const { deployments, getNamedAccounts, ethers } = hre
        const { deploy } = deployments

        const { deployer } = await getNamedAccounts()

        const newChainlinkPriceFeed = await deploy(`${pair}ChainlinkPriceFeed`, {
            from: deployer,
            contract: "ChainlinkPriceFeed",
            args: [aggregator],
            log: true,
        })

        console.log(`${pair} PriceFeed address: ${newChainlinkPriceFeed.address}`)
    })

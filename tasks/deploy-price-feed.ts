import { task } from "hardhat/config"
import { HardhatRuntimeEnvironment } from "hardhat/types"

task("priceFeed.deploy").setAction(async ({ args }, hre: HardhatRuntimeEnvironment) => {
    const { deployments, getNamedAccounts, ethers } = hre
    const { deploy } = deployments

    const { deployer } = await getNamedAccounts()

    /* const newAggregator = await deploy("TestAggregatorV3", {
        args: [],
        from: deployer,
        log: true,
    })

    const newChainlinkPriceFeed = await deploy("ChainlinkPriceFeed", {
        args: [newAggregator.address],
        from: deployer,
        log: true,
    })

    console.log(`PriceFeed address: ${newChainlinkPriceFeed.address}`) */

    const PriceFeed = (await ethers.getContractFactory("TestAggregatorV3")).attach(
        "0x4a5aFc4C1DF2B9dD34347a437f4894A02B81Bf0A",
    )

    const decimals = await PriceFeed.decimals({ gasLimit: 8000000000 })

    console.log(decimals)
})

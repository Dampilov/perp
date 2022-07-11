import { HardhatRuntimeEnvironment } from "hardhat/types"

module.exports = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts, ethers } = hre
    const { deploy } = deployments

    const { deployer } = await getNamedAccounts()

    const clearingHouseConfigAddress = (await deployments.get("ClearingHouseConfig")).address
    const orderBookAddress = (await deployments.get("OrderBook")).address
    const marketRegistryAddress = (await deployments.get("MarketRegistry")).address

    await deploy("Exchange", {
        from: deployer,
        proxy: {
            proxyContract: "OpenZeppelinTransparentProxy",
            execute: {
                init: {
                    methodName: "initialize",
                    args: [clearingHouseConfigAddress, orderBookAddress, marketRegistryAddress],
                },
            },
        },
        log: true,
    })
}

module.exports.tags = ["Exchange"]
module.exports.dependencies = ["ClearingHouseConfig", "OrderBook", "MarketRegistry"]

import { HardhatRuntimeEnvironment } from "hardhat/types"

module.exports = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts, ethers } = hre
    const { deploy } = deployments

    const { deployer } = await getNamedAccounts()

    const marketRegistryAddress = (await deployments.get("MarketRegistry")).address

    await deploy("OrderBook", {
        from: deployer,
        proxy: {
            proxyContract: "OpenZeppelinTransparentProxy",
            execute: {
                init: {
                    methodName: "initialize",
                    args: [marketRegistryAddress],
                },
            },
        },
        log: true,
    })
}

module.exports.tags = ["OrderBook"]
module.exports.dependencies = ["MarketRegistry"]

import { HardhatRuntimeEnvironment } from "hardhat/types"

module.exports = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts, ethers } = hre
    const { deploy } = deployments

    const { deployer } = await getNamedAccounts()

    const ClearingHouseConfigAddress = (await deployments.get("ClearingHouseConfig")).address
    const OrderBookAddress = (await deployments.get("OrderBook")).address

    await deploy("AccountBalance", {
        from: deployer,
        proxy: {
            proxyContract: "OpenZeppelinTransparentProxy",
            execute: {
                init: {
                    methodName: "initialize",
                    args: [ClearingHouseConfigAddress, OrderBookAddress],
                },
            },
        },
        log: true,
    })
}

module.exports.tags = ["AccountBalance"]
module.exports.dependencies = ["ClearingHouseConfig", "OrderBook"]

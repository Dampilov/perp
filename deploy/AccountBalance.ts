import { HardhatRuntimeEnvironment } from "hardhat/types"

module.exports = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts, ethers } = hre
    const { deploy } = deployments

    const { deployer } = await getNamedAccounts()

    const ClearingHouseConfigAddress = (await deployments.get("ClearingHouseConfig")).address
    const OrderBookAddress = (await deployments.get("OrderBook")).address
    const exchangeAddress = (await deployments.get("Exchange")).address

    const accountBalance = await deploy("AccountBalance", {
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

    const Exchange = (await ethers.getContractFactory("Exchange")).attach(exchangeAddress)
    let tx = await (await Exchange.setAccountBalance(accountBalance.address)).wait()
    console.log(`Exchange.setAccountBalance: ${tx.transactionHash}`)
}

module.exports.tags = ["AccountBalance"]
module.exports.dependencies = ["ClearingHouseConfig", "OrderBook", "Exchange"]

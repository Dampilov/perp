import { HardhatRuntimeEnvironment } from "hardhat/types"

module.exports = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts, ethers } = hre
    const { deploy } = deployments

    const { deployer } = await getNamedAccounts()

    const Name = "QuoteToken"
    const Symbol = "QTT"

    await deploy("QuoteToken", {
        from: deployer,
        proxy: {
            proxyContract: "OpenZeppelinTransparentProxy",
            execute: {
                init: {
                    methodName: "initialize",
                    args: [Name, Symbol],
                },
            },
        },
        log: true,
    })
}

module.exports.tags = ["QuoteToken"]

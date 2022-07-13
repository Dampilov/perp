import { HardhatRuntimeEnvironment } from "hardhat/types"

module.exports = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts, ethers } = hre
    const { deploy } = deployments

    const { deployer } = await getNamedAccounts()

    const Name = "vBTC"
    const Symbol = "vBTC"
    const chainlinkPriceFeed = "0xECe365B379E1dD183B20fc5f022230C044d51404"

    await deploy("BaseToken", {
        from: deployer,
        proxy: {
            proxyContract: "OpenZeppelinTransparentProxy",
            execute: {
                init: {
                    methodName: "initialize",
                    args: [Name, Symbol, chainlinkPriceFeed],
                },
            },
        },
        log: true,
    })
}

module.exports.tags = ["vBTC"]

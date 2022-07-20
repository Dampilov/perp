import { HardhatRuntimeEnvironment } from "hardhat/types"

module.exports = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts, ethers } = hre
    const { deploy } = deployments

    const { deployer } = await getNamedAccounts()

    const clearinghouseconfig = await deploy("ClearingHouseConfig", {
        from: deployer,
        proxy: {
            proxyContract: "OpenZeppelinTransparentProxy",
            execute: {
                init: {
                    methodName: "initialize",
                    args: [],
                },
            },
        },
        log: true,
    })

    const ClearingHouseConfig = (await ethers.getContractFactory("ClearingHouseConfig")).attach(
        clearinghouseconfig.address,
    )

    await (await ClearingHouseConfig.setSettlementTokenBalanceCap("1000000")).wait()
}

module.exports.tags = ["ClearingHouseConfig"]

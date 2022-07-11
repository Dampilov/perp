import { HardhatRuntimeEnvironment } from "hardhat/types"

module.exports = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts, ethers } = hre
    const { deploy } = deployments

    const { deployer } = await getNamedAccounts()

    const clearingHouseConfigAddress = (await deployments.get("ClearingHouseConfig")).address
    const vaultAddress = (await deployments.get("Vault")).address
    const maxCollateralTokensPerAccountArg = 10
    const debtNonSettlementTokenValueRatioArg = 10
    const liquidationRatioArg = 10
    const mmRatioBufferArg = 10
    const clInsuranceFundFeeRatioArg = 10
    const debtThresholdArg = 10
    const collateralValueDustArg = 10

    await deploy("CollateralManager", {
        from: deployer,
        proxy: {
            proxyContract: "OpenZeppelinTransparentProxy",
            execute: {
                init: {
                    methodName: "initialize",
                    args: [
                        clearingHouseConfigAddress,
                        vaultAddress,
                        maxCollateralTokensPerAccountArg,
                        debtNonSettlementTokenValueRatioArg,
                        liquidationRatioArg,
                        mmRatioBufferArg,
                        clInsuranceFundFeeRatioArg,
                        debtThresholdArg,
                        collateralValueDustArg,
                    ],
                },
            },
        },
        log: true,
    })
}

module.exports.tags = ["CollateralManager"]
module.exports.dependencies = ["ClearingHouseConfig", "Vault"]

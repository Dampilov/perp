import { parseUnits } from "ethers/lib/utils"
import { HardhatRuntimeEnvironment } from "hardhat/types"

module.exports = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts, ethers } = hre
    const { deploy } = deployments

    const { deployer } = await getNamedAccounts()

    const usdcDecimals = 6

    const clearingHouseConfigAddress = (await deployments.get("ClearingHouseConfig")).address
    const vaultAddress = (await deployments.get("Vault")).address
    const maxCollateralTokensPerAccountArg = 3
    const debtNonSettlementTokenValueRatioArg = 750000
    const liquidationRatioArg = 500000
    const mmRatioBufferArg = 5000
    const clInsuranceFundFeeRatioArg = 12500
    const debtThresholdArg = 10000
    const collateralValueDustArg = 350

    const collateralManager = await deploy("CollateralManager", {
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
                        parseUnits(debtThresholdArg.toString(), usdcDecimals),
                        parseUnits(collateralValueDustArg.toString(), usdcDecimals),
                    ],
                },
            },
        },
        log: true,
    })

    const Vault = (await ethers.getContractFactory("Vault")).attach(vaultAddress)
    await (await Vault.setCollateralManager(collateralManager.address)).wait()
}

module.exports.tags = ["CollateralManager"]
module.exports.dependencies = ["ClearingHouseConfig", "Vault"]

import { parseEther, parseUnits } from "ethers/lib/utils"
import { task } from "hardhat/config"
import { HardhatRuntimeEnvironment } from "hardhat/types"

task("clearingHouse.addLiquidity")
    .addParam("contract", "Contract address")
    .addParam("basetoken", "Token address")
    .addParam("base", "Token address")
    .addParam("quote", "Token address")
    .addParam("lowertick", "Token address")
    .addParam("uppertick", "Token address")
    .addParam("minbase", "Token address")
    .addParam("minquote", "Token address")
    .setAction(
        async (
            { contract, basetoken, base, quote, lowertick, uppertick, minbase, minquote },
            hre: HardhatRuntimeEnvironment,
        ) => {
            const { ethers } = hre

            const ClearingHouseContract = (await ethers.getContractFactory("ClearingHouse")).attach(contract)

            const tx = await (
                await ClearingHouseContract.addLiquidity({
                    baseToken: basetoken,
                    base: parseEther(base),
                    quote: parseUnits(quote, "6"), // QuoteToken decimals = 6 (USDC)
                    lowerTick: lowertick,
                    upperTick: uppertick,
                    minBase: minbase,
                    minQuote: minquote,
                    useTakerBalance: false,
                    deadline: ethers.constants.MaxUint256,
                })
            ).wait()

            console.log(`CleaningHouse.addLiquidity: ${tx.transactionHash}`)
        },
    )

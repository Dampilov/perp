import { ethers } from "hardhat"
import { encodePriceSqrt } from "../test/shared/utilities"

export async function initMarket(): Promise<{}> {
    const minTick = 100
    const maxTick = 100000
    const exFeeRatio = 1000 // 0.1%
    const ifFeeRatio = 100000 // 10%
    const initPrice = 151.373306858723226652
    const baseToken = "0xBd11da6B3cFbbe94572Ad57EfEF3a1ddd680B4fD"
    const quoteToken = "0xcf96548C8e70211698303874030989cC16Fe81De"

    const uniPoolFactory = await ethers.getContractFactory("UniswapV3Pool")
    const uniPool = uniPoolFactory.attach("0xB957d36cBDa6FFd2AD40F5F5E0C72acbE584f46e")
    await uniPool.initialize(encodePriceSqrt(initPrice.toString(), "1"))
    const uniFeeRatio = await uniPool.fee()
    const tickSpacing = await uniPool.tickSpacing()

    // the initial number of oracle can be recorded is 1; thus, have to expand it
    await uniPool.increaseObservationCardinalityNext(500)

    // update config
    const marketRegistryFactory = await ethers.getContractFactory("MarketRegistry")
    const marketRegistry = marketRegistryFactory.attach("0xB91700d62bd16604C61271ba8F7d8e3091146637")
    await marketRegistry.addPool(baseToken, uniFeeRatio)
    await marketRegistry.setFeeRatio(baseToken, exFeeRatio)
    await marketRegistry.setInsuranceFundFeeRatio(baseToken, ifFeeRatio)
}

import { Exchange, RewardContracts, SnapStructure, StakingService } from '@types';
import { ethers } from 'ethers';

const stakingContracts: { [key in RewardContracts]: string | { [key: string]: string } } = {
    UNI_V2: {
        '0xbb2b8038a1640196fbe3e38816f3e67cba72d940': '0xca35e32e7926b96a9988f61d510e038108d8068e',
        '0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc': '0x7fba4b8dc5e7616e59622806932dbea72537a56b',
        '0x0d4a11d5eeaac28ec3f61d100daf4d40471f1852': '0x6c3e4cb2e96b01f4b866965a91ed4437839a121a',
        '0xa478c2975ab1ea89e8196811f51a7b7ade33eb11': '0xa1484c3aa22a66c62b77e0ae78e15258bd0cb711',
    },
    BALANCER: '0x6d19b2bF3A36A61530909Ae65445a906D98A2Fa8',
    SUSHI: '0xc2EdaD668740f1aA35E4D8f227fB8E17dcA888Cd',
    INDEX: {
        '0x4d5ef58aac27d99935e5b6b4a6778ff292059991': '0xB93b505Ed567982E2b6756177ddD23ab5745f309',
    },
};

const stakingRewardsAbi = ['function earned(address user) public view returns (uint256)'];

const masterChefAbi = [
    'function pendingSushi(uint256 _pid, address user) external view returns (uint256)',
];

async function setUnclaimed(
    provider: ethers.providers.Provider,
    address: string,
    snaps: SnapStructure,
): Promise<void> {
    for (const [poolId, poolSnaps] of Object.entries(snaps)) {
        const lastSnap = poolSnaps[poolSnaps.length - 1];
        if (lastSnap.stakingService !== null) {
            if (lastSnap.yieldReward === null) {
                // TODO: send log to firebase along with address
                console.log(
                    'ERROR: null reward object in setUnclaimed for non-null stakingService',
                );
                continue;
            }
            let unclaimed = 0;
            if (
                lastSnap.stakingService === StakingService.UNI_V2 ||
                lastSnap.stakingService === StakingService.INDEX
            ) {
                let contractAddress = (<{ [key: string]: string }>(
                    stakingContracts[lastSnap.stakingService]
                ))[poolId];
                const contract = new ethers.Contract(contractAddress, stakingRewardsAbi, provider);
                unclaimed = await contract.earned(address);
            } else if (lastSnap.stakingService === StakingService.SUSHI) {
                let contractAddress = stakingContracts[lastSnap.stakingService] as string;
                const contract = new ethers.Contract(contractAddress, masterChefAbi, provider);
                unclaimed = await contract.pendingSushi(lastSnap.idWithinStakingContract, address);
            }
            lastSnap.yieldReward.unclaimed = unclaimed * 10 ** -18;
        } else if (lastSnap.exchange === Exchange.BALANCER) {
            // TODO
        }
    }
}

export { setUnclaimed };

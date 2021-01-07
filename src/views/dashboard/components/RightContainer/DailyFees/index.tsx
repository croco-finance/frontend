import { Spinner, GrayBox, FiatValue } from '@components/ui';
import { variables } from '@config';
import { useTheme } from '@hooks';
import { useSelector } from '@reducers';
import { PoolItem } from '@types';
import { formatUtils, graphUtils, mathUtils } from '@utils';
import React from 'react';
import styled from 'styled-components';
import FeesGraph from './Graph';

const Wrapper = styled.div<{ height: number }>`
    min-height: ${props => props.height + 10}px;
    width: 100%;
    border-bottom: 1px solid ${props => props.theme.STROKE_GREY};
    margin-top: 30px;
    padding: 10px 8px 40px 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
`;

const GraphHeadline = styled.div`
    display: flex;
    justify-content: center;
    width: 100%;
    height: 30px;
    color: ${props => props.theme.FONT_MEDIUM};
    font-size: ${variables.FONT_SIZE.NORMAL};
`;
const StyledGrayBox = styled(GrayBox)`
    margin: 30px 15px 0px 20px;
`;
const FeeStatsBox = styled.div`
    display: flex;
    width: 100%;
`;

const Stat = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 33%;
    color: ${props => props.theme.FONT_MEDIUM};
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};

    @media (max-width: ${variables.SCREEN_SIZE.MD}) {
        font-size: ${variables.FONT_SIZE.SMALL};
    }
`;

const FeeStatHeadline = styled.div`
    color: ${props => props.theme.FONT_LIGHT};
    margin-right: 8px;
`;
interface Props extends React.HTMLAttributes<HTMLDivElement> {
    selectedPool: PoolItem | undefined;
    graphHeight?: number;
}

const DailyFees = ({ selectedPool, graphHeight = 380 }: Props) => {
    const { loadingDaily, errorDaily } = useSelector(state => state);
    const theme: any = useTheme();

    let data: any = null;
    let feesUsd: number[] | null = null;
    if (selectedPool) {
        // hide fees chart for inactive pools
        if (!selectedPool.isActive) return null;

        if (selectedPool.dailyStats) {
            data = graphUtils.getDailyGraphData(selectedPool.dailyStats, selectedPool.tokenSymbols);
            feesUsd = selectedPool.dailyStats.feesUsd;
        }
    }

    const earnedSinceText = data
        ? formatUtils.getFormattedDateFromTimestamp(data[0].timestamp, 'MONTH_DAY')
        : '...';

    if (errorDaily) return null;

    return (
        <Wrapper height={graphHeight}>
            {loadingDaily ? (
                <Spinner size={20} />
            ) : (
                <>
                    <GraphHeadline>{`Daily fees earned since ${earnedSinceText}`}</GraphHeadline>
                    {data && feesUsd ? (
                        <>
                            <FeesGraph
                                data={data}
                                averageFees={mathUtils.getArrayAverage(feesUsd)}
                                theme={theme}
                                height={graphHeight}
                            ></FeesGraph>
                            <StyledGrayBox
                                backgroundColor={theme.BACKGROUND}
                                padding={[10, 10, 10, 10]}
                            >
                                <FeeStatsBox>
                                    <Stat>
                                        <FeeStatHeadline>Min:</FeeStatHeadline>
                                        <FiatValue value={Math.min(...feesUsd)} />
                                    </Stat>
                                    <Stat>
                                        <FeeStatHeadline>Max:</FeeStatHeadline>
                                        <FiatValue value={Math.max(...feesUsd)} />
                                    </Stat>
                                    <Stat>
                                        <FeeStatHeadline>Avg:</FeeStatHeadline>
                                        <FiatValue value={mathUtils.getArrayAverage(feesUsd)} />
                                    </Stat>
                                </FeeStatsBox>
                            </StyledGrayBox>
                        </>
                    ) : null}
                </>
            )}
        </Wrapper>
    );
};

export default DailyFees;

import { Spinner } from '@components/ui';
import { variables } from '@config';
import { useTheme } from '@hooks';
import { useSelector } from '@reducers';
import { PoolItem } from '@types';
import { formatUtils, graphUtils } from '@utils';
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
interface Props extends React.HTMLAttributes<HTMLDivElement> {
    selectedPool: PoolItem | undefined;
    graphHeight?: number;
}

const DailyFees = ({ selectedPool, graphHeight = 380 }: Props) => {
    const { loadingDaily, errorDaily } = useSelector(state => state);
    const theme: any = useTheme();

    let data: any = null;
    if (selectedPool) {
        // hide fees chart for inactive pools
        if (!selectedPool.isActive) return null;

        if (selectedPool.dailyStats) {
            data = graphUtils.getDailyGraphData(selectedPool.dailyStats, selectedPool.tokenSymbols);
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
                    {data && <FeesGraph data={data} theme={theme} height={graphHeight}></FeesGraph>}
                </>
            )}
        </Wrapper>
    );
};

export default DailyFees;

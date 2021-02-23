import { Spinner, GrayBox, FiatValue, InfoBox, QuestionTooltip } from '@components/ui';
import { variables } from '@config';
import { useTheme } from '@hooks';
import { useSelector } from '@reducers';
import { DailyStats } from '@types';
import { formatUtils, graphUtils, mathUtils } from '@utils';
import React from 'react';
import styled from 'styled-components';
import FeesGraph from './Graph';

const Wrapper = styled.div<{ height: number; noBorder: boolean }>`
    min-height: ${props => props.height + 10}px;
    width: 100%;
    border-bottom: ${props => (props.noBorder ? 'none' : `1px solid ${props.theme.STROKE_GREY}}`)};
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
    align-items: center;
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

const StyledInfoBox = styled(InfoBox)`
    max-width: 80%;
    justify-content: center;
    font-size: ${variables.FONT_SIZE.TINY};
    padding: 5px;
    margin-left: 10px;
`;

interface Props extends React.HTMLAttributes<HTMLDivElement> {
    dailyStats: DailyStats;
    graphHeight?: number;
    noBorder?: boolean;
}

const DailyFeesChart = ({ dailyStats, graphHeight = 380, noBorder = false }: Props) => {
    const { loadingDaily, errorDaily } = useSelector(state => state.app);
    const theme: any = useTheme();

    const graphData = graphUtils.getDailyGraphData(dailyStats);
    const { feesUsd, errorDays } = dailyStats;

    const earnedSinceText = graphData
        ? formatUtils.getFormattedDateFromTimestamp(graphData[0].timestamp, 'MONTH_DAY')
        : '...';

    let exceptionContent;
    if (loadingDaily) exceptionContent = <Spinner size={20} />;
    if (errorDaily)
        exceptionContent = <InfoBox>We encountered some issues while fetching daily fees </InfoBox>;

    return (
        <Wrapper height={graphHeight} noBorder={noBorder}>
            {loadingDaily ? (
                exceptionContent
            ) : (
                <>
                    <GraphHeadline>
                        {`Daily fees earned since ${earnedSinceText}`}
                        <QuestionTooltip
                            content={
                                'Includes only rewards from trading fees (yield rewards are not included). Fee value is computed for token prices at the particular day.'
                            }
                        />
                    </GraphHeadline>
                    {errorDays.length > 0 && (
                        <StyledInfoBox iconSize={14}>
                            {`We couldn't get all fees for: ${errorDays.map(
                                timestamp =>
                                    ` ${formatUtils.getFormattedDateFromTimestamp(
                                        timestamp,
                                        'MONTH_DAY',
                                    )}  `,
                            )}`}
                        </StyledInfoBox>
                    )}
                    {graphData && feesUsd ? (
                        <>
                            <FeesGraph
                                data={graphData}
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

export default DailyFeesChart;

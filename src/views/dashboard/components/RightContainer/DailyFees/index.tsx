import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { fetchDailyFees, graphUtils } from '@utils';
import { Spinner } from '@components/ui';
import { useSelector } from '@reducers';
import { PoolItem } from '@types';
import FeesGraph from './Graph';
import { variables } from '@config';
import { useTheme } from '@hooks';

const Wrapper = styled.div`
    min-height: 120px;
    width: 100%;
    border-bottom: 2px solid #e1e3e7;
    margin-top: 30px;
    padding: 10px 8px 36px 8px;
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
    poolId: string;
    selectedPool: PoolItem | undefined;
}

const DailyFees = ({ selectedPool, poolId }: Props) => {
    let [feeData, setFeeData] = useState(null);
    let [isLoading, setIsLoading] = useState(false);
    let [isError, setIsError] = useState(false);
    let [graphData, setGraphData] = useState<any>(null);

    const theme: any = useTheme();

    useEffect(() => {
        const fetchData = async () => {
            console.log(`Fetching fee data for poolId: ${poolId}...`);
            setIsLoading(true);
            setIsError(false);
            // try {
            const feeData = await fetchDailyFees(poolId);
            console.log('selectedPool', selectedPool);

            if (selectedPool) {
                const data = graphUtils.getDailyFeesGraphData(feeData, selectedPool);
                console.log('dailyBalances', data);
                setGraphData(data);
            }

            console.log('feeData', feeData);

            setFeeData(feeData);
            setIsError(false);
            setIsLoading(false);
            // } catch (e) {
            //     setFeeData(null);
            //     setIsError(true);
            //     setIsLoading(false);
            //     console.log('Error while fetching daily fees data');
            // }
        };
        fetchData();
    }, [poolId]);

    let spinner: React.ReactNode = null;

    if (isLoading) {
        spinner = <Spinner size={18} />;
    }

    return (
        <Wrapper>
            <GraphHeadline>
                {isLoading ? spinner : 'Fees earned during the last week'}
            </GraphHeadline>
            {/* <h3>{spinner}</h3> */}
            {graphData && <FeesGraph data={graphData} theme={theme}></FeesGraph>}
        </Wrapper>
    );
};

export default DailyFees;

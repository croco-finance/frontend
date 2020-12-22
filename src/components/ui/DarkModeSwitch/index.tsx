import { setTheme } from '@actions';
import { Icon } from '@components/ui';
import { variables } from '@config';
import { useSelector } from '@reducers';
import React from 'react';
import { useDispatch } from 'react-redux';
import styled from 'styled-components';

const Wrapper = styled.div``;

const IconWrapper = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    border-radius: 100px;
    height: 40px;
    width: 40px;
    cursor: pointer;

    @media (min-width: ${variables.SCREEN_SIZE.SM}) {
        padding: 10px;
    }
`;

const DarkModeSwitch = () => {
    const dispatch = useDispatch();
    const theme = useSelector(state => state.theme);

    return (
        <Wrapper>
            {theme === 'light' ? (
                <IconWrapper
                    onClick={() => {
                        dispatch(setTheme('dark'));
                    }}
                >
                    <Icon icon={'darkMode'} size={20} />
                </IconWrapper>
            ) : (
                <IconWrapper
                    onClick={() => {
                        dispatch(setTheme('light'));
                    }}
                >
                    <Icon icon={'dayMode'} size={20} />
                </IconWrapper>
            )}
        </Wrapper>
    );
};
export default DarkModeSwitch;

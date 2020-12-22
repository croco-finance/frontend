import { useTheme as useSCTheme } from 'styled-components';

export const useTheme = () => {
    const theme = useSCTheme();
    return theme;
};

export const getNumberFromPxString = (size: string): number => {
    return parseInt(size.replace('px', ''), 10);
};

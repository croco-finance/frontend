import * as actionTypes from '@actionTypes';

const initialState = {
    modalType: null,
    modalProps: {},
};

const modalReducer = (state = initialState, action) => {
    switch (action.type) {
        case actionTypes.OPEN_MODAL:
            return {
                modalType: action.payload.type,
                modalProps: action.payload.props,
            };

        case actionTypes.CLOSE_MODAL: {
            return initialState;
        }

        default:
            return state;
    }
};

export default modalReducer;

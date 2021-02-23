import { MODAL } from '../actions/constants';

const initialState = {
    modalType: null,
    modalProps: {},
};

const modalReducer = (state = initialState, action) => {
    switch (action.type) {
        case MODAL.OPEN:
            return {
                modalType: action.modalType,
                modalProps: action.modalProps,
            };

        case MODAL.CLOSE: {
            return initialState;
        }

        default:
            return state;
    }
};

export default modalReducer;

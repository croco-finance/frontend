enum StateProperty {
    app = 'app',
    comments = 'comments',
}

interface IAction {
    type: string;
    payload: any;
}
export const LOADING = (stateProperty: StateProperty): string => `${stateProperty}/loading`;
export const SETDATA = (stateProperty: StateProperty): string => `${stateProperty}/setdata`;
export const LOAD_ERROR = (stateProperty: StateProperty): string => `${stateProperty}/loaderror`;
export const RESET = (stateProperty: StateProperty): string => `${stateProperty}/reset`;

export const dataLoadingAction = (stateProperty: StateProperty) => ({
    payload: {},
    type: LOADING(stateProperty),
});
export const dataUpdateAction = (stateProperty: StateProperty, payload: any) => ({
    payload,
    type: SETDATA(stateProperty),
});
export const dataLoadingErrorAction = (stateProperty: StateProperty, error: any) => ({
    payload: error,
    type: LOAD_ERROR(stateProperty),
});

interface IReducer {
    isLoading: boolean;
    loadError: boolean;
    isStale: boolean;
    loadErrorDetails?: any;
    payload: any;
}
export const getAsyncDataReducer = (stateProperty: StateProperty) => {
    const reducer = (
        state: IReducer = {
            isLoading: false,
            loadError: false,
            isStale: false,
            loadErrorDetails: null,
            payload: null,
        },
        action: IAction,
    ) => {
        switch (action.type) {
            case LOADING(stateProperty):
                return {
                    ...state,
                    isLoading: true,
                    isStale: true,
                    loadErrorDetails: null,
                };
            case SETDATA(stateProperty):
                return {
                    ...state,
                    isLoading: false,
                    isStale: false,
                    loadErrorDetails: null,
                    payload: action.payload,
                };
            case LOAD_ERROR(stateProperty):
                return {
                    ...state,
                    isLoading: false,
                    loadError: true,
                    loadErrorDetails: action.payload,
                };
            case RESET(stateProperty):
                return {
                    ...state,
                    isLoading: false,
                    isStale: false,
                    loadError: false,
                    loadErrorDetails: null,
                };
            default:
                return state;
        }
    };
    return reducer;
};

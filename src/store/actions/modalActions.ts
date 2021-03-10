import * as actionTypes from '@actionTypes';

export type UserContextPayload =
    | {
          type: 'address';
      }
    | {
          type: 'feedback';
      };

export type ModalAction =
    | {
          type: typeof actionTypes.CLOSE_MODAL;
      }
    | {
          type: typeof actionTypes.OPEN_MODAL;
          payload: UserContextPayload;
      };

export const closeModal = (): ModalAction => ({
    type: actionTypes.CLOSE_MODAL,
});

export const openModal = (payload: UserContextPayload): ModalAction => ({
    type: actionTypes.OPEN_MODAL,
    payload,
});

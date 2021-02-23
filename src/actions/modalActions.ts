import { MODAL } from './constants';

export type UserContextPayload =
    | {
          type: 'address';
      }
    | {
          type: 'feedback';
      };

export type ModalAction =
    | {
          type: typeof MODAL.CLOSE;
      }
    | {
          type: typeof MODAL.OPEN;
          payload: UserContextPayload;
      };

export const onCancel = (): ModalAction => ({
    type: MODAL.CLOSE,
});

export const openModal = (payload: UserContextPayload): ModalAction => ({
    type: MODAL.OPEN,
    payload,
});

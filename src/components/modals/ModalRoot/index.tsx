// These are regular React components we will write soon
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { closeModal } from '@actions';

import { ManageAddressesModal, FeedbackModal, WalletModal } from '@components/modals';

const ModalRoot = () => {
    const modalType = useSelector(state => state.modal.modalType);
    const dispatch = useDispatch();

    switch (modalType) {
        case 'address':
            return <ManageAddressesModal onCancel={() => dispatch(closeModal())} />;
        case 'wallet':
            return <WalletModal onCancel={() => dispatch(closeModal())} />;
        case 'feedback':
            return <FeedbackModal onCancel={() => dispatch(closeModal())} />;

        default:
            return null;
    }
};

export default ModalRoot;

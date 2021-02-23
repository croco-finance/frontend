// These are regular React components we will write soon
import { AddressModal, FeedbackModal } from '@components/containers';
import React from 'react';
import { useSelector } from 'react-redux';

const MODAL_COMPONENTS = {
    ADDRESS: AddressModal,
    FEEDBACK: FeedbackModal,
    /* other modals */
};

const ModalRoot = () => {
    const modalType = useSelector(state => state.modalType);
    const modalProps = useSelector(state => state.modalProps);

    if (!modalType) {
        return <span />; // after React v15 you can return null here
    }

    const SpecificModal = MODAL_COMPONENTS[modalType];
    return <SpecificModal {...modalProps} />;
};

export default ModalRoot;

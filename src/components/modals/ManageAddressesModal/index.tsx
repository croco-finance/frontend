// These are regular React components we will write soon
import { AddressModal } from '@components/containers';
import { Modal } from '@components/layout';
import React from 'react';

interface Props {
    onCancel: () => void;
}
const ManageAddressesModal = (props: Props) => (
    <Modal
        cancelable
        onCancel={() => props.onCancel()}
        heading="Manage addresses"
        showHeaderBorder={false}
    >
        <AddressModal />
    </Modal>
);

export default ManageAddressesModal;

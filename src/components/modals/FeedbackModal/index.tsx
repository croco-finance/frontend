import { FeedbackView } from '@components/containers';
import { Modal } from '@components/layout';
import React from 'react';

interface Props {
    onCancel: () => void;
}
const FeedbackModal = (props: Props) => (
    <Modal
        cancelable
        onCancel={() => props.onCancel()}
        heading="Feedback form"
        showHeaderBorder={false}
        descriptionAlign="left"
    >
        <FeedbackView />
    </Modal>
);

export default FeedbackModal;

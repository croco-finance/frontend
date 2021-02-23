import { FeedbackView } from '@components/containers';
import { Modal } from '@components/layout';
import React from 'react';

interface Props {
    onCancel: () => void;
}
const FeedbackModal = (props: Props) => {
    return (
        <Modal
            cancelable
            onCancel={() => props.onCancel()}
            heading="Feedback form"
            description="This feedback is 100% anonymous - we know only the information that you type in this form."
            showHeaderBorder={false}
            descriptionAlign="left"
        >
            <FeedbackView />
        </Modal>
    );
};

export default FeedbackModal;

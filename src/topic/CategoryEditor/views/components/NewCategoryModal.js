import React from 'react';
import PropTypes from 'prop-types';

import {
    ModalHeader,
    ModalBody,
    ModalFooter,
} from '../../../../public/components/View';
import {
    Button,
    PrimaryButton,
} from '../../../../public/components/Action';
import { TextInput } from '../../../../public/components/Input';

import styles from '../styles.scss';

const propTypes = {
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    editMode: PropTypes.bool,
    initialValue: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    editMode: false,
    initialValue: {},
};

export default class NewCategoryModal extends React.PureComponent {
    static defaultProps = defaultProps;
    static propTypes = propTypes;

    constructor(props) {
        super(props);

        const { title: titleValue = '' } = props.initialValue || {};
        this.state = {
            showModal: false,
            titleValue,
        };
    }

    handleTitleValueChange = (value) => {
        this.setState({
            titleValue: value,
        });
    }

    handleModalClose = () => {
        this.props.onClose();
    }

    handleModalOk = () => {
        this.props.onSubmit(this.state.titleValue);
    }

    render() {
        const { editMode } = this.props;
        const title = editMode ? 'Edit category' : 'Add new category';
        return ([
            <ModalHeader
                key="header"
                title={title}
            />,
            <ModalBody key="body">
                <TextInput
                    label="Title"
                    placeholder="eg: Sector"
                    onChange={this.handleTitleValueChange}
                    value={this.state.titleValue}
                />
            </ModalBody>,
            <ModalFooter key="footer">
                <Button onClick={this.handleModalClose} >
                    Cancel
                </Button>
                <PrimaryButton
                    onClick={this.handleModalOk}
                    className={styles['ok-button']}
                >
                    Ok
                </PrimaryButton>
            </ModalFooter>,
        ]);
    }
}
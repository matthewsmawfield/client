import PropTypes from 'prop-types';
import React from 'react';
import Faram, { requiredCondition } from '@togglecorp/faram';

import Checkbox from '#rsci/Checkbox';
import DangerConfirmButton from '#rsca/ConfirmButton/DangerConfirmButton';
import Modal from '#rscv/Modal';
import ModalBody from '#rscv/Modal/Body';
import ModalFooter from '#rscv/Modal/Footer';
import ModalHeader from '#rscv/Modal/Header';
import NonFieldErrors from '#rsci/NonFieldErrors';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import TextInput from '#rsci/TextInput';

import _ts from '#ts';

import styles from './styles.scss';

const propTypes = {
    title: PropTypes.string.isRequired,
    onSave: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    data: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    data: {},
};

export default class DateFrameworkList extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static schema = {
        fields: {
            title: [requiredCondition],
            informationDateSelected: [],
        },
    };

    constructor(props) {
        super(props);

        const {
            title,
            data: {
                informationDateSelected,
            },
        } = props;

        this.state = {
            faramErrors: {},
            faramValues: {
                title,
                informationDateSelected,
            },
            pristine: false,
        };
    }

    handleFaramChange = (faramValues, faramErrors) => {
        this.setState({
            faramValues,
            faramErrors,
            pristine: true,
        });
    };

    handleFaramValidationFailure = (faramErrors) => {
        this.setState({
            faramErrors,
            pristine: false,
        });
    };

    handleFaramValidationSuccess = (_, faramValues) => {
        const {
            title,
            ...otherProps
        } = faramValues;
        this.props.onSave(otherProps, title);
    };

    render() {
        const {
            faramValues,
            faramErrors,
            pristine,
        } = this.state;
        const {
            onClose,
            title,
        } = this.props;

        const titleInputLabel = _ts('widgets.editor.date', 'titleLabel');
        const titleInputPlaceholder = _ts('widgets.editor.date', 'widgetTitlePlaceholder');
        const checkboxLabel = _ts('widgets.editor.date', 'informationDateCheckboxLabel');
        const cancelButtonLabel = _ts('widgets.editor.date', 'cancelButtonLabel');
        const saveButtonLabel = _ts('widgets.editor.date', 'saveButtonLabel');
        const cancelConfirmMessage = _ts('widgets.editor.date', 'cancelConfirmMessage');

        return (
            <Modal className={styles.editModal}>
                <Faram
                    onChange={this.handleFaramChange}
                    onValidationFailure={this.handleFaramValidationFailure}
                    onValidationSuccess={this.handleFaramValidationSuccess}
                    schema={DateFrameworkList.schema}
                    value={faramValues}
                    error={faramErrors}
                >
                    <ModalHeader title={title} />
                    <ModalBody>
                        <NonFieldErrors faramElement />
                        <TextInput
                            faramElementName="title"
                            autoFocus
                            label={titleInputLabel}
                            placeholder={titleInputPlaceholder}
                            selectOnFocus
                            showHintAndError={false}
                        />
                        <Checkbox
                            faramElementName="informationDateSelected"
                            className={styles.checkbox}
                            label={checkboxLabel}
                        />
                    </ModalBody>
                    <ModalFooter>
                        <DangerConfirmButton
                            onClick={onClose}
                            confirmationMessage={cancelConfirmMessage}
                            skipConfirmation={pristine}
                        >
                            {cancelButtonLabel}
                        </DangerConfirmButton>
                        <PrimaryButton
                            type="submit"
                            disabled={!pristine}
                        >
                            {saveButtonLabel}
                        </PrimaryButton>
                    </ModalFooter>
                </Faram>
            </Modal>
        );
    }
}

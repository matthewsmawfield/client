import PropTypes from 'prop-types';
import React from 'react';

import NumberInput from '#rsci/NumberInput';
import DangerButton from '#rsca/Button/DangerButton';
import TextInput from '#rsci/TextInput';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import Modal from '#rscv/Modal';
import ModalHeader from '#rscv/Modal/Header';
import ModalBody from '#rscv/Modal/Body';
import NonFieldErrors from '#rsci/NonFieldErrors';
import ModalFooter from '#rscv/Modal/Footer';
import Faram, { requiredCondition } from '#rsci/Faram';
import { isTruthy } from '#rsu/common';

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

export default class NumberFrameworkList extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static schema = {
        validation: ({ minValue: min, maxValue: max } = {}) => {
            const errors = [];
            if (isTruthy(min) && isTruthy(max) && min >= max) {
                // FIXME: use strings
                errors.push('Min value must be less than max value.');
            }
            return errors;
        },
        fields: {
            title: [requiredCondition],
            minValue: [],
            maxValue: [],
        },
    }

    constructor(props) {
        super(props);

        const {
            title,
            data: {
                minValue,
                maxValue,
            },
        } = this.props;

        this.state = {
            faramErrors: {},
            faramValues: {
                title,
                maxValue,
                minValue,
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
    }

    handleFaramValidationFailure = (faramErrors) => {
        this.setState({
            faramErrors,
            pristine: false,
        });
    }

    handleFaramValidationSuccess = (values) => {
        const {
            title,
            minValue,
            maxValue,
        } = values;

        const newRange = {
            minValue,
            maxValue,
        };

        this.props.onSave(newRange, title);
    }

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

        const titleInputLabel = _ts('framework.numberWidget', 'titleLabel');
        const titleInputPlaceholder = _ts('framework.numberWidget', 'widgetTitlePlaceholder');
        const cancelButtonLabel = _ts('framework.numberWidget', 'cancelButtonLabel');
        const saveButtonLabel = _ts('framework.numberWidget', 'saveButtonLabel');
        const separatorText = ' ';

        return (
            <Modal>
                <Faram
                    onChange={this.handleFaramChange}
                    onValidationFailure={this.handleFaramValidationFailure}
                    onValidationSuccess={this.handleFaramValidationSuccess}
                    schema={NumberFrameworkList.schema}
                    value={faramValues}
                    error={faramErrors}
                >
                    <ModalHeader title={title} />
                    <ModalBody>
                        <NonFieldErrors faramElement />
                        <TextInput
                            faramElementName="title"
                            label={titleInputLabel}
                            placeholder={titleInputPlaceholder}
                            className={styles.input}
                            autoFocus
                            selectOnFocus
                        />
                        <div className={styles.numberContainer} >
                            <NumberInput
                                faramElementName="minValue"
                                className={styles.input}
                                placeholder={_ts('framework.numberWidget', 'numberPlaceholder')}
                                label={_ts('framework.numberWidget', 'minValueLabel')}
                                separator={separatorText}
                            />
                            <NumberInput
                                faramElementName="maxValue"
                                className={styles.input}
                                placeholder={_ts('framework.numberWidget', 'numberPlaceholder')}
                                label={_ts('framework.numberWidget', 'maxValueLabel')}
                                separator={separatorText}
                            />
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <DangerButton onClick={onClose}>
                            {cancelButtonLabel}
                        </DangerButton>
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

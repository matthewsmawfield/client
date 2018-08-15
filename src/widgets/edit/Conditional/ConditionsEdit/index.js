import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import Faram, { requiredCondition } from '#rsci/Faram';
import FaramList from '#rsci/Faram/FaramList';
import DangerButton from '#rsca/Button/DangerButton';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import Modal from '#rscv/Modal';
import ModalHeader from '#rscv/Modal/Header';
import ListView from '#rscv/List/ListView';
import ModalBody from '#rscv/Modal/Body';
import NonFieldErrors from '#rsci/NonFieldErrors';
import ModalFooter from '#rscv/Modal/Footer';
import { randomString } from '#rsu/common';

import {
    afIdFromRoute,

    afViewAnalysisFrameworkSelector,
} from '#redux';

import WidgetPreview from '../WidgetPreview';
import styles from './styles.scss';

const propTypes = {
    conditions: PropTypes.shape({
        list: PropTypes.array,
        operator: PropTypes.oneOf(['AND', 'OR']),
    }).isRequired,
    onSave: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,

    analysisFramework: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    analysisFrameworkId: PropTypes.number.isRequired,
};

const defaultProps = {
    analysisFramework: undefined,
};

const mapStateToProps = (state, props) => ({
    analysisFramework: afViewAnalysisFrameworkSelector(state, props),
    analysisFrameworkId: afIdFromRoute(state, props),
});

@connect(mapStateToProps)
export default class ConditionsEditModal extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static schema = {
        fields: {
            conditions: [],
        },
    };

    static keyExtractor = widget => widget.key;

    constructor(props) {
        super(props);
        const { conditions } = this.props;

        this.state = {
            faramValues: conditions,
            faramErrors: {},
            pristine: false,
        };
    }

    widgetListRendererParams = (key, widget) => {
        const {
            widgetId,
            title,
        } = widget;

        return ({
            title,
            faramInfoForAdd: {
                newElement: () => ({
                    key: `${widgetId}-${randomString(16)}`,
                }),
            },
        });
    }

    handleFaramChange = (faramValues, faramErrors) => {
        console.warn(faramValues);
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
        this.props.onSave(faramValues);
    };

    render() {
        const {
            analysisFramework: { widgets = [] },
            analysisFrameworkId,
            onClose,
        } = this.props;
        const {
            faramValues,
            faramErrors,
            pristine,
        } = this.state;

        return (
            <Modal className={styles.conditionEditModal} >
                {/* FIXME: Use strings */}
                <Faram
                    className={styles.form}
                    onChange={this.handleFaramChange}
                    onValidationFailure={this.handleFaramValidationFailure}
                    onValidationSuccess={this.handleFaramValidationSuccess}
                    schema={ConditionsEditModal.schema}
                    value={faramValues}
                    error={faramErrors}
                >
                    <ModalHeader
                        title="Conditions Edit"
                    />
                    <ModalBody className={styles.modalBody} >
                        <FaramList faramElementName="list">
                            <div className={styles.leftContainer}>
                                <ListView
                                    className={styles.widgetList}
                                    data={widgets}
                                    renderer={WidgetPreview}
                                    keyExtractor={ConditionsEditModal.keyExtractor}
                                    rendererParams={this.widgetListRendererParams}
                                />
                            </div>
                            <div className={styles.rightContainer}>
                                Right
                            </div>
                        </FaramList>
                    </ModalBody>
                    <ModalFooter>
                        <DangerButton onClick={onClose}>
                            Cancel
                        </DangerButton>
                        <PrimaryButton
                            type="submit"
                            disabled={!pristine}
                        >
                            Save
                        </PrimaryButton>
                    </ModalFooter>
                </Faram>
            </Modal>
        );
    }
}

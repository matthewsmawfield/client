import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import TextInput from '../../../../../vendor/react-store/components/Input/TextInput';
import Button from '../../../../../vendor/react-store/components/Action/Button';
import PrimaryButton from '../../../../../vendor/react-store/components/Action/Button/PrimaryButton';
import Modal from '../../../../../vendor/react-store/components/View/Modal';
import ModalHeader from '../../../../../vendor/react-store/components/View/Modal/Header';
import ModalBody from '../../../../../vendor/react-store/components/View/Modal/Body';
import ModalFooter from '../../../../../vendor/react-store/components/View/Modal/Footer';

import { afStringsSelector } from '../../../../../redux';
import BoundError from '../../../../../components/BoundError';

import styles from './styles.scss';

const propTypes = {
    title: PropTypes.string.isRequired,
    widgetKey: PropTypes.string.isRequired,
    editAction: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    afStrings: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
    afStrings: afStringsSelector(state),
});

@BoundError
@connect(mapStateToProps)
@CSSModules(styles)
export default class GeoFrameworkList extends React.PureComponent {
    static propTypes = propTypes;

    constructor(props) {
        super(props);

        this.state = {
            showEditModal: false,
            title: props.title,
        };

        this.props.editAction(this.handleEdit);
    }

    componentDidMount() {
        const { onChange } = this.props;

        onChange(
            undefined,
            this.createFilters(),
            this.createExportable(),
        );
    }

    createFilters = () => {
        const { title, widgetKey } = this.props;

        return [{
            title,
            widgetKey,
            key: widgetKey,
            filterType: 'list',
            properties: {
                type: 'geo',
            },
        }];
    }

    createExportable = () => {
        const excel = {
            type: 'geo',
        };

        return {
            widgetKey: this.props.widgetKey,
            data: {
                excel,
            },
        };
    }

    handleWidgetTitleChange = (value) => {
        this.setState({ title: value });
    }

    handleEdit = () => {
        this.setState({ showEditModal: true });
    }

    handleModalCancelButtonClick = () => {
        this.setState({
            showEditModal: false,
            title: this.props.title,
        });
    }

    handleModalSaveButtonClick = () => {
        this.setState({ showEditModal: false });
        const { title } = this.state;

        this.props.onChange(
            undefined,
            this.createFilters(),
            this.createExportable(),
            title,
        );
    }

    render() {
        const { showEditModal, title } = this.state;

        return (
            <div styleName="geo-list">
                {this.props.afStrings('geoAreaButtonLabel')}
                { showEditModal &&
                    <Modal>
                        <ModalHeader title={this.props.afStrings('editTitleModalHeader')} />
                        <ModalBody>
                            <TextInput
                                label={this.props.afStrings('titleLabel')}
                                placeholder={this.props.afStrings('widgetTitlePlaceholder')}
                                onChange={this.handleWidgetTitleChange}
                                value={title}
                                showHintAndError={false}
                                autoFocus
                                selectOnFocus
                            />
                        </ModalBody>
                        <ModalFooter>
                            <Button onClick={this.handleModalCancelButtonClick}>
                                {this.props.afStrings('cancelButtonLabel')}
                            </Button>
                            <PrimaryButton onClick={this.handleModalSaveButtonClick}>
                                {this.props.afStrings('saveButtonLabel')}
                            </PrimaryButton>
                        </ModalFooter>
                    </Modal>
                }
            </div>
        );
    }
}
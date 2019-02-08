import PropTypes from 'prop-types';
import React from 'react';

import ModalHeader from '#rscv/Modal/Header';
import Wizard from '#rscv/Wizard';

import _ts from '#ts';
import _cs from '#cs';

import { RequestCoordinator } from '#request';

import FileTypeSelectionPage from './FileTypeSelectionPage';
import AttributesPage from './AttributesPage';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    mimeType: PropTypes.string,
    lead: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    setTabularBook: PropTypes.func.isRequired, // eslint-disable-line react/no-unused-prop-types
    onCancel: PropTypes.func.isRequired,
};

const defaultProps = {
    className: '',
    mimeType: '',
};


@RequestCoordinator
export default class LeadTabular extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    state = {
        bookId: undefined,
        fileType: undefined,
        metaInfo: undefined,
    }

    handleBookIdChange = (bookId, fileType, callback) => {
        this.setState({ bookId, fileType }, callback);
    }

    handleMetaInfo = (metaInfo, fileType, callback) => {
        this.setState({ metaInfo, fileType }, callback);
    }

    handleComplete = () => {
        const { onCancel, setTabularBook } = this.props;
        const { bookId } = this.state;

        if (!bookId) {
            onCancel();
        } else {
            setTabularBook(bookId);
        }
    }

    handleWizardPageChange = (page) => {
        this.setState({ page });
    }

    render() {
        const {
            className,
            mimeType,
            onCancel,
            lead,
        } = this.props;

        const {
            bookId,
            fileType,
            page,
            metaInfo,
        } = this.state;
        console.warn(lead);

        return (
            <div
                className={_cs(
                    className,
                    styles.leadTabular,
                    `page-${page}`,
                )}
            >
                <ModalHeader title={_ts('addLeads.tabular', 'title')} />
                <Wizard
                    className={styles.wizard}
                    onPageChange={this.handleWizardPageChange}
                    initialPage={page}
                >
                    <FileTypeSelectionPage
                        lead={lead}
                        mimeType={mimeType}
                        onMetaGet={this.handleMetaInfo}
                        onCancel={onCancel}
                    />
                    <AttributesPage
                        bookId={bookId}
                        lead={lead}
                        onComplete={this.handleBookIdChange}
                        metaInfo={metaInfo}
                        defaultFileType={fileType}
                        onCancel={onCancel}
                    />
                </Wizard>
            </div>
        );
    }
}

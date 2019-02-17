import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import memoize from 'memoize-one';

import Modal from '#rscv/Modal';
import modalize from '#rscg/Modalize';
import AccentButton from '#rsca/Button/AccentButton';
import MultiViewContainer from '#rscv/MultiViewContainer';
import ScrollTabs from '#rscv/ScrollTabs';

import {
    LEAD_TYPE,
    LEAD_PANE_TYPE,
    leadPaneTypeMap,
} from '#entities/lead';
import { entryAccessor } from '#entities/editEntries';
import { iconNames } from '#constants';
import ImagesGrid from '#components/viewer/ImagesGrid';
import TabularBook from '#components/other/TabularBook';
import brainIcon from '#resources/img/brain.png';
import _ts from '#ts';

import AssistedTagging from './AssistedTagging';
import LeadPreview from './LeadPreview';
import SimplifiedLeadPreview from './SimplifiedLeadPreview';
import TabularPreview from './TabularPreview';

import styles from './styles.scss';

const AccentModalButton = modalize(AccentButton);

const propTypes = {
    projectRole: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    lead: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    onExcerptCreate: PropTypes.func,
    filteredEntries: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    setSelectedEntryKey: PropTypes.func,
    viewsModifier: PropTypes.func,
    tabsModifier: PropTypes.func,
};

const defaultProps = {
    projectRole: {},
    filteredEntries: [],
    onExcerptCreate: () => {},
    setSelectedEntryKey: () => {},
    viewsModifier: undefined,
    tabsModifier: undefined,
};

const getPaneType = (lead) => {
    if (!lead) {
        return undefined;
    }
    const {
        sourceType: type,
        attachment,
    } = lead;

    if (type === LEAD_TYPE.text) {
        return LEAD_PANE_TYPE.text;
    } else if (type === LEAD_TYPE.website) {
        return LEAD_PANE_TYPE.website;
    }
    if (!attachment) {
        return undefined;
    }
    const { mimeType } = attachment;
    return leadPaneTypeMap[mimeType];
};

// TODO: use this in assessment as well
export default class LeftPane extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            images: [],
            currentTab: undefined,
        };

        const { viewsModifier } = this.props;
        this.views = {
            ...this.getViews(styles.container),
            ...(viewsModifier ? viewsModifier() : {}),
        };
    }

    getCurrentTab = memoize((currentTab, tabs) => {
        if (currentTab) {
            return currentTab;
        }
        // If there is no currentTab, get first visible tab
        const tabKeys = Object.keys(tabs).filter(a => !!tabs[a]);
        return tabKeys.length > 0 ? Object.keys(tabs)[0] : undefined;
    })

    getTabs = memoize((lead, images, entryPermissions = {}) => {
        const leadPaneType = getPaneType(lead);
        let tabs = {};
        switch (leadPaneType) {
            case LEAD_PANE_TYPE.csv:
                break;
            case LEAD_PANE_TYPE.spreadsheet:
                tabs = {
                    ...tabs,
                    'original-preview': _ts('editEntry.overview.leftpane', 'tabularTabLabel'),
                    'images-preview': _ts('editEntry.overview.leftpane', 'imagesTabLabel'),
                };
                break;
            case LEAD_PANE_TYPE.image:
                tabs = {
                    ...tabs,
                    'original-preview': _ts('editEntry.overview.leftpane', 'imagesTabLabel'),
                    'images-preview': _ts('editEntry.overview.leftpane', 'imagesTabLabel'),
                };
                break;
            case LEAD_PANE_TYPE.text:
                tabs = {
                    ...tabs,
                    'simplified-preview': _ts('editEntry.overview.leftpane', 'simplifiedTabLabel'),
                    'assisted-tagging': _ts('editEntry.overview.leftpane', 'assistedTabLabel'),
                    'images-preview': _ts('editEntry.overview.leftpane', 'imagesTabLabel'),
                };
                break;
            case LEAD_PANE_TYPE.word:
            case LEAD_PANE_TYPE.pdf:
            case LEAD_PANE_TYPE.presentation:
            case LEAD_PANE_TYPE.website:
                tabs = {
                    ...tabs,
                    'simplified-preview': _ts('editEntry.overview.leftpane', 'simplifiedTabLabel'),
                    'assisted-tagging': _ts('editEntry.overview.leftpane', 'assistedTabLabel'),
                    'original-preview': _ts('editEntry.overview.leftpane', 'originalTabLabel'),
                    'images-preview': _ts('editEntry.overview.leftpane', 'imagesTabLabel'),
                };
                break;
            default:
                return undefined;
        }

        // Dont' show tabular if it is not extracted
        if (lead.tabularBook) {
            tabs['tabular-preview'] = _ts('editEntry.overview.leftpane', 'quantitativeTabLabel');
            delete tabs['original-preview'];
        }
        // Don't show images if there are no images
        if (!images || images.length <= 0) {
            delete tabs['images-preview'];
        }
        // Don't show assisted if no creation permission
        if (!entryPermissions.create) {
            delete tabs['assisted-tagging'];
        }

        return tabs;
    })

    getViews = () => ({
        'simplified-preview': {
            component: SimplifiedLeadPreview,
            rendererParams: () => {
                const {
                    lead: { id: leadId },
                    filteredEntries,
                } = this.props;
                return {
                    className: styles.container,
                    leadId,
                    highlights: this.getHighlightsForText(filteredEntries),
                    onLoad: this.handleLoad,
                    onClick: this.handleHighlightClick,
                };
            },
            mount: true,
            lazyMount: true,
            wrapContainer: true,
        },
        'tabular-preview': {
            component: TabularPreview,
            rendererParams: () => {
                const {
                    lead: { tabularBook },
                    filteredEntries,
                } = this.props;
                return {
                    className: styles.container,
                    bookId: tabularBook,
                    highlights: this.getHighlightsForTabular(filteredEntries),
                    onClick: this.handleHighlightClick,
                };
            },
            mount: true,
            lazyMount: true,
            wrapContainer: true,
        },
        'assisted-tagging': {
            component: AssistedTagging,
            rendererParams: () => {
                const {
                    lead: {
                        id: leadId,
                        project: projectId,
                    },
                } = this.props;
                return {
                    className: styles.container,
                    leadId,
                    projectId,
                    onEntryAdd: this.handleEntryAdd,
                };
            },
            mount: true,
            lazyMount: true,
            wrapContainer: true,
        },
        'original-preview': {
            component: LeadPreview,
            rendererParams: () => {
                const {
                    projectRole: {
                        entryPermissions = {},
                    },
                    lead,
                } = this.props;

                return {
                    className: styles.container,
                    lead,
                    handleScreenshot: this.handleScreenshot,
                    showScreenshot: entryPermissions.create,
                };
            },
            mount: true,
            lazyMount: true,
            wrapContainer: true,
        },
        'images-preview': {
            component: ImagesGrid,
            rendererParams: () => {
                const { images } = this.state;
                return {
                    className: styles.container,
                    images,
                };
            },
            mount: true,
            lazyMount: true,
            wrapContainer: true,
        },
    })

    // Simplified Lead Preview

    getHighlightsForText = memoize(entries => (
        entries
            .filter(e => entryAccessor.entryType(e) === 'excerpt')
            .map(entry => ({
                key: entryAccessor.key(entry),
                // text is used by simplified lead preview
                text: entryAccessor.excerpt(entry),
                color: entryAccessor.color(entry) || '#c0c0c0',
            }))
    ))

    getHighlightsForTabular = memoize(entries => (
        entries
            .filter(e => entryAccessor.entryType(e) === 'dataSeries')
            .map(entry => ({
                key: entryAccessor.key(entry),
                // dataSeries fieldId is used by simplified lead preview
                dataSeriesFieldId: (entryAccessor.dataSeries(entry) || {}).fieldId,
                color: entryAccessor.color(entry) || '#c0c0c0',
            }))
    ))

    handleHighlightClick = (e, { key }) => {
        const {
            setSelectedEntryKey,
            lead,
        } = this.props;

        setSelectedEntryKey({
            leadId: lead.id,
            key,
        });
    }

    handleLoad = (response) => {
        if (response.images) {
            this.setState({ images: response.images });
        }
    }

    // Assisted Tagging

    handleEntryAdd = (text) => {
        this.props.onExcerptCreate({
            type: 'excerpt',
            value: text,
        });
    }

    // Lead Preview

    handleScreenshot = (image) => {
        this.props.onExcerptCreate({
            type: 'image',
            value: image,
        });
    }

    // Other

    handleTabClick = (key) => {
        this.setState({ currentTab: key });
    }

    renderTabularModal = ({ closeModal }) => (
        <Modal
            onClose={closeModal}
            className={styles.tabularModal}
        >
            <TabularBook
                className={styles.tabularBook}
                bookId={this.props.lead.tabularBook}
                projectId={this.props.lead.project}
                onCancel={closeModal}
                viewMode
            />
        </Modal>
    )

    render() {
        const {
            projectRole: { entryPermissions },
            lead,
            tabsModifier,
        } = this.props;
        const {
            images,
            currentTab,
        } = this.state;

        const tabs = this.getTabs(lead, images, entryPermissions);
        const modifiedTabs = tabsModifier
            ? tabsModifier(tabs)
            : tabs;

        const tabKey = this.getCurrentTab(currentTab, modifiedTabs);

        const TabularModal = this.renderTabularModal;

        return (
            <Fragment>
                <ScrollTabs
                    className={styles.tabs}
                    active={tabKey}
                    tabs={modifiedTabs}
                    onClick={this.handleTabClick}
                >
                    { tabKey === 'assisted-tagging' &&
                        <img
                            className={styles.brainIcon}
                            src={brainIcon}
                            alt="assisted-tagging"
                            title={_ts('components.assistedTagging', 'infoTooltip')}
                        />
                    }
                    { tabKey === 'tabular-preview' &&
                        <AccentModalButton
                            iconName={iconNames.table}
                            transparent
                            // FIXME: use strings
                            title="Show tabular"
                            modal={
                                <TabularModal />
                            }
                        />
                    }
                </ScrollTabs>
                <MultiViewContainer
                    active={tabKey}
                    views={this.views}
                />
            </Fragment>
        );
    }
}
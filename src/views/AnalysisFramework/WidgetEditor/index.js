import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import memoize from 'memoize-one';

import Faram, { FaramGroup } from '@togglecorp/faram';

import Icon from '#rscg/Icon';
import DangerConfirmButton from '#rsca/ConfirmButton/DangerConfirmButton';
import GridLayoutEditor from '#rscv/GridLayoutEditor';

import {
    updateAfViewWidgetAction,
    updateAfViewWidgetLayoutAction,
    removeAfViewWidgetAction,
} from '#redux';
import { isDevelopment } from '#config/env';

import {
    fetchWidget,
    gridSize,
    VIEW,
    hasWidgetFrameworkComponent,
    fetchWidgetFrameworkComponent,
    shouldShowAltTagComponent,
} from '#widgets';

import _ts from '#ts';

import EditButton from './EditButton';
import styles from './styles.scss';

const propTypes = {
    widgets: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    analysisFrameworkId: PropTypes.number.isRequired,

    updateWidget: PropTypes.func.isRequired,
    updateWidgetLayout: PropTypes.func.isRequired,
    removeWidget: PropTypes.func.isRequired,

    widgetType: PropTypes.string.isRequired,
};

const defaultProps = {
    widgets: [],
};

const mapDispatchToProps = dispatch => ({
    removeWidget: params => dispatch(removeAfViewWidgetAction(params)),
    updateWidget: params => dispatch(updateAfViewWidgetAction(params)),
    updateWidgetLayout: params => dispatch(updateAfViewWidgetLayoutAction(params)),
});

@connect(undefined, mapDispatchToProps)
export default class WidgetEditor extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static keySelector = widget => widget.key;

    static schema = {};
    static value = {};

    getWidgets = memoize((widgets, widgetType) => (
        widgets.filter(
            w => hasWidgetFrameworkComponent(w.widgetId, widgetType, w.properties.addedFrom),
        )
    ))

    widgetMinSizeSelector = (widget) => {
        const { widgetType } = this.props;
        const { widgetId } = widget;
        const { minSize } = fetchWidget(widgetType, widgetId);
        return minSize;
    }

    handleItemChange = (newWidget) => {
        const {
            analysisFrameworkId,
            updateWidget,
        } = this.props;

        updateWidget({
            analysisFrameworkId,
            widget: newWidget,
        });
    }

    handleItemRemove = (widgetId) => {
        const {
            analysisFrameworkId,
            removeWidget,
        } = this.props;

        removeWidget({
            analysisFrameworkId,
            widgetId,
        });
    }

    handleWidgetLayoutChange = (key, layout) => {
        const {
            widgetType,
            updateWidgetLayout,
            analysisFrameworkId,
        } = this.props;

        updateWidgetLayout({
            analysisFrameworkId,
            widgetKey: key,
            widgetType,
            layout,
        });
    }

    layoutSelector = (widget) => {
        const { widgetType } = this.props;
        const {
            properties: {
                overviewGridLayout,
                listGridLayout,
            } = {},
        } = widget;

        return widgetType === VIEW.overview ? overviewGridLayout : listGridLayout;
    }

    renderWidgetHeader = (widget) => {
        const {
            title,
            widgetId,
            key,
            properties: { addedFrom },
        } = widget;
        const { widgetType } = this.props;
        const { editComponent: Widget } = fetchWidget(widgetType, widgetId);
        const hideButtons = shouldShowAltTagComponent(widgetId, widgetType, addedFrom);

        const layout = this.layoutSelector(widget);
        const widthBlocks = Math.ceil(layout.width / gridSize.width);
        const heightBlocks = Math.ceil(layout.height / gridSize.height);

        const headerTitle = isDevelopment
            ? `${title} [${widthBlocks} ⨯ ${heightBlocks}]`
            : title;

        const headingClassName = `
            ${styles.heading}
            ${hideButtons ? styles.disabled : ''}
        `;

        return (
            <div className={styles.header}>
                <h5
                    title={title}
                    className={headingClassName}
                >
                    {headerTitle}
                </h5>
                <div className={styles.actionButtons}>
                    {
                        !hideButtons ? (
                            <Fragment>
                                <EditButton
                                    widget={widget}
                                    renderer={Widget}
                                    onChange={this.handleItemChange}
                                />
                                <DangerConfirmButton
                                    iconName="delete"
                                    title={_ts('framework.widgetEditor', 'deleteTooltip')}
                                    tabIndex="-1"
                                    confirmationMessage={_ts('framework.widgetEditor', 'deleteConfirmDetail')}
                                    transparent
                                    onClick={() => this.handleItemRemove(key)}
                                />
                            </Fragment>
                        ) : (
                            <Icon
                                name="info"
                                className={styles.infoIcon}
                                title={_ts('framework.widgetEditor', 'infoTooltip', { addedFrom })}
                            />
                        )
                    }
                </div>
            </div>
        );
    }

    renderWidgetContent = (widget) => {
        const {
            title,
            widgetId,
            id,
            properties: {
                addedFrom,
                listGridLayout: {
                    width = 0,
                    height = 0,
                } = {},
            },
        } = widget;

        const { widgetType } = this.props;

        let disablerMaskText;
        let fontSize;

        const isDisabled = shouldShowAltTagComponent(widgetId, widgetType, addedFrom);

        // FIXME: use Message component?
        if (isDisabled) {
            disablerMaskText = _ts('framework.widgetEditor', 'disablerMastText', { title });
            fontSize = Math.min(
                18,
                Math.max(
                    9,
                    Math.round(width * Math.sqrt(height) * 0.006),
                ),
            );
        }

        const Widget = fetchWidgetFrameworkComponent(
            widgetId,
            widgetType,
            addedFrom,
        );

        const className = `
            ${styles.content}
            ${isDisabled ? styles.disabled : ''}
        `;


        return (
            <div className={className}>
                <FaramGroup faramElementName={String(id)}>
                    <FaramGroup faramElementName="data">
                        <Widget
                            widgetName={widgetId}
                            widgetType={widgetType}
                            widget={widget}

                            entryType="excerpt"
                            excerpt=""
                            image={undefined}

                            disabled
                        />
                    </FaramGroup>
                </FaramGroup>
                { isDisabled && (
                    <div
                        className={styles.disablerMask}
                        style={{
                            fontSize: `${fontSize}px`,
                        }}
                    >
                        { disablerMaskText }
                    </div>
                )}
            </div>
        );
    }

    render() {
        const {
            widgets,
            widgetType,
        } = this.props;

        const filteredWidgets = this.getWidgets(widgets, widgetType);

        return (
            <Faram
                className={styles.widgetEditorFaram}
                schema={WidgetEditor.schema}
                value={WidgetEditor.value}
                disabled
            >
                <GridLayoutEditor
                    className={styles.gridLayoutEditor}
                    gridSize={gridSize}
                    data={filteredWidgets}
                    layoutSelector={this.layoutSelector}
                    itemMinSizeSelector={this.widgetMinSizeSelector}
                    itemHeaderModifier={this.renderWidgetHeader}
                    itemContentModifier={this.renderWidgetContent}
                    keySelector={WidgetEditor.keySelector}
                    itemClassName={styles.widget}
                    onLayoutChange={this.handleWidgetLayoutChange}
                    dragItemClassName={styles.heading}
                />
            </Faram>
        );
    }
}

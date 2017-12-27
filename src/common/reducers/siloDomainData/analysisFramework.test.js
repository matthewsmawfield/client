import reducers, {
    AF__SET_ANALYSIS_FRAMEWORK,
    AF__VIEW_ADD_WIDGET,
    AF__REMOVE_WIDGET,
    AF__VIEW_UPDATE_WIDGET,
    setAfViewAnalysisFrameworkAction,
    addAfViewWidgetAction,
    removeAfViewWidgetAction,
    updateAfViewWidgetAction,
} from './analysisFramework';


test('should set analaysis framework', () => {
    const state = {
        analysisFrameworkView: { },
    };

    const action = setAfViewAnalysisFrameworkAction({
        analysisFramework: { id: 1 },
    });
    const after = {
        analysisFrameworkView: {
            analysisFramework: { id: 1 },
        },
    };

    expect(reducers[AF__SET_ANALYSIS_FRAMEWORK](state, action)).toEqual(after);
});

test('should skip adding widget', () => {
    const state = {
        analysisFrameworkView: { },
    };

    const action = addAfViewWidgetAction({
        widget: { key: '1', name: 'widget1' },
        analysisFrameworkId: 1,
    });
    const after = {
        analysisFrameworkView: {
        },
    };
    expect(reducers[AF__VIEW_ADD_WIDGET](state, action)).toEqual(after);
});

test('should skip adding widget', () => {
    const state = {
        analysisFrameworkView: {
            analysisFramework: {},
        },
    };

    const action = addAfViewWidgetAction({
        widget: { key: '1', name: 'widget1' },
        analysisFrameworkId: 1,
    });
    const after = {
        analysisFrameworkView: {
            analysisFramework: {},
        },
    };
    expect(reducers[AF__VIEW_ADD_WIDGET](state, action)).toEqual(after);
});

test('should add widget', () => {
    const state = {
        analysisFrameworkView: {
            analysisFramework: { id: 1 },
        },
    };

    const action = addAfViewWidgetAction({
        widget: { key: '1', name: 'widget1' },
        filters: [{ key: '1', properties: { dummy: true } }],
        exportable: { data: { dummy: true } },
        analysisFrameworkId: 1,
    });
    const after = {
        analysisFrameworkView: {
            analysisFramework: {
                id: 1,
                widgets: [{ key: '1', name: 'widget1' }],
                filters: [{ widgetKey: '1', key: '1', properties: { dummy: true } }],
                exportables: [{ widgetKey: '1', data: { dummy: true } }],
            },
        },
    };
    expect(reducers[AF__VIEW_ADD_WIDGET](state, action)).toEqual(after);
});

test('should remove widget', () => {
    const state = {
        analysisFrameworkView: {
            analysisFramework: {
                id: 1,
                widgets: [
                    { key: '1', name: 'widget1' },
                    { key: '2', name: 'widget2' },
                ],
                filters: [
                    { widgetKey: '2', key: '2', properties: { dummy: true } },
                ],
                exportables: [
                    { widgetKey: '2', data: { dummy: true } },
                ],
            },
        },
    };
    const action = removeAfViewWidgetAction({
        widgetId: '2',
        analysisFrameworkId: 1,
    });
    const after = {
        analysisFrameworkView: {
            analysisFramework: {
                id: 1,
                widgets: [
                    { key: '1', name: 'widget1' },
                ],
                filters: [],
                exportables: [],
            },
        },
    };
    expect(reducers[AF__REMOVE_WIDGET](state, action)).toEqual(after);
});

test('should update widget', () => {
    const state = {
        analysisFrameworkView: {
            analysisFramework: {
                id: 1,
                widgets: [
                    { key: '1', name: 'widget1' },
                    { key: '2', name: 'widget2' },
                ],
                filters: [
                    { widgetKey: '1', key: '1', name: 'f1', id: 'f1' },
                    { widgetKey: '2', key: '1', name: 'f2', id: 'f2' },
                ],
                exportables: [
                    { widgetKey: '1', a: 'x', b: 'y' },
                ],
            },
        },
    };
    const action = updateAfViewWidgetAction({
        widget: { key: '1', name: 'widget3' },
        filters: [
            { key: '1', name: 'f_1', id: 'f1' },
            { key: '2', name: 'f_2', id: 'f2' },
        ],
        exportable: { b: 'z' },
        analysisFrameworkId: 1,
    });
    const after = {
        analysisFrameworkView: {
            analysisFramework: {
                id: 1,
                widgets: [
                    { key: '1', name: 'widget3' },
                    { key: '2', name: 'widget2' },
                ],
                filters: [
                    { widgetKey: '1', key: '1', name: 'f_1', id: 'f1' },
                    { widgetKey: '2', key: '1', name: 'f2', id: 'f2' },
                    { widgetKey: '1', key: '2', name: 'f_2', id: 'f2' },
                ],
                exportables: [
                    { widgetKey: '1', a: 'x', b: 'z' },
                ],
            },
        },
    };
    expect(reducers[AF__VIEW_UPDATE_WIDGET](state, action)).toEqual(after);
});

test('should skip updating widget', () => {
    const state = {
        analysisFrameworkView: {
            analysisFramework: {
                id: 1,
                widgets: [
                    { key: '1', name: 'widget1' },
                    { key: '2', name: 'widget2' },
                ],
                filters: [],
                exportables: [],
            },
        },
    };
    const action = updateAfViewWidgetAction({
        widget: { key: '3', name: 'widget3' },
        analysisFrameworkId: 1,
    });
    const after = {
        analysisFrameworkView: {
            analysisFramework: {
                id: 1,
                widgets: [
                    { key: '1', name: 'widget1' },
                    { key: '2', name: 'widget2' },
                ],
                filters: [],
                exportables: [],
            },
        },
    };
    expect(reducers[AF__VIEW_UPDATE_WIDGET](state, action)).toEqual(after);
});

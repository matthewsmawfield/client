import update from '#rs/utils/immutable-update';

// TYPE

export const DP__SET_PROJECT_LIST = 'siloDomainData/DP__SET_PROJECT_LIST';
export const DP__DELETE_PROJECT = 'siloDomainData/DP__DELETE_PROJECT';

export const DP__SET_FILTERS = 'siloDomainData/DP__SET_FILTERS';
export const DP__UNSET_FILTERS = 'siloDomainData/DP__UNSET_FILTERS';

export const DP__SET_ACTIVE_PAGE = 'siloDomainData/DP__SET_ACTIVE_PAGE';
export const DP__SET_ACTIVE_SORT = 'siloDomainData/DP__SET_ACTIVE_SORT';
export const DP__SET_PROJECTS_PER_PAGE = 'siloDomainData/DP__SET_PROJECTS_PER_PAGE';

export const DP__SET_PROJECT_OPTIONS = 'siloDomainData/DP__SET_PROJECT_OPTIONS';

// ACTION-CREATOR

export const setDiscoverProjectsProjectListAction = ({ projectList, totalProjectsCount }) => ({
    type: DP__SET_PROJECT_LIST,
    projectList,
    totalProjectsCount,
});

export const deleteDiscoverProjectsProjectAction = ({ projectId }) => ({
    type: DP__DELETE_PROJECT,
    projectId,
});

export const setDiscoverProjectsFilterAction = filters => ({
    type: DP__SET_FILTERS,
    filters,
});

export const unsetDiscoverProjectsFilterAction = () => ({
    type: DP__UNSET_FILTERS,
});


export const setDiscoverProjectsActivePageAction = activePage => ({
    type: DP__SET_ACTIVE_PAGE,
    activePage,
});

export const setDiscoverProjectsActiveSortAction = activeSort => ({
    type: DP__SET_ACTIVE_SORT,
    activeSort,
});

export const setDiscoverProjectsProjectPerPageAction = projectsPerPage => ({
    type: DP__SET_PROJECTS_PER_PAGE,
    projectsPerPage,
});

export const setDiscoverProjectsProjectOptionsAction = projectOptions => ({
    type: DP__SET_PROJECT_OPTIONS,
    projectOptions,
});

// REDUCER

const setProjects = (state, action) => {
    const { projectList, totalProjectsCount } = action;
    const settings = {
        discoverProjectsView: { $auto: {
            projectList: { $set: projectList },
            totalProjectsCount: { $set: totalProjectsCount },
        } },
    };
    return update(state, settings);
};

const deleteProject = (state, action) => {
    const { projectId } = action;
    const { discoverProjectsView } = state;
    const { projectList } = discoverProjectsView;

    const projectIndex = projectList.findIndex(d => d.id === projectId);

    const settings = {
        discoverProjectsView: {
            projectList: { $splice: [[projectIndex, 1]] },
        },
    };
    return update(state, settings);
};

const setFilters = (state, action) => {
    const { filters } = action;

    const settings = {
        discoverProjectsView: {
            filters: { $set: filters },
            activePage: { $set: 1 },
        },
    };
    return update(state, settings);
};

const unsetFilters = (state) => {
    const settings = {
        discoverProjectsView: {
            filters: { $set: undefined },
            activePage: { $set: 1 },
        },
    };
    return update(state, settings);
};

const setActivePage = (state, action) => {
    const { activePage } = action;
    const settings = {
        discoverProjectsView: {
            activePage: { $set: activePage },
        },
    };
    return update(state, settings);
};

const setActiveSort = (state, action) => {
    const { activeSort } = action;
    const settings = {
        discoverProjectsView: {
            activeSort: { $set: activeSort },
            activePage: { $set: 1 },
        },
    };
    return update(state, settings);
};

const setProjectsPerPage = (state, action) => {
    const { projectsPerPage } = action;
    const settings = {
        discoverProjectsView: {
            projectsPerPage: { $set: projectsPerPage },
            activePage: { $set: 1 },
        },
    };
    return update(state, settings);
};

const setProjectOptions = (state, action) => {
    const { projectOptions } = action;
    const settings = {
        discoverProjectsView: {
            projectOptions: { $set: projectOptions },
        },
    };
    return update(state, settings);
};


// REDUCER MAP

const reducers = {
    [DP__SET_PROJECT_LIST]: setProjects,
    [DP__DELETE_PROJECT]: deleteProject,
    [DP__SET_FILTERS]: setFilters,
    [DP__UNSET_FILTERS]: unsetFilters,
    [DP__SET_ACTIVE_PAGE]: setActivePage,
    [DP__SET_ACTIVE_SORT]: setActiveSort,
    [DP__SET_PROJECTS_PER_PAGE]: setProjectsPerPage,
    [DP__SET_PROJECT_OPTIONS]: setProjectOptions,
};

export default reducers;

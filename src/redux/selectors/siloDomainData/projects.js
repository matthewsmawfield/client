import { createSelector } from 'reselect';
import { mapToList } from '@togglecorp/fujs';

import { projectIdFromRoute } from '../domainData';

const emptyObject = {};
const emptyArray = [];

const projectViewSelector = ({ siloDomainData }) => siloDomainData.projectsView || emptyObject;

export const projectSelector = createSelector(
    projectViewSelector,
    projectIdFromRoute,
    (projectPage, activeProject) => (
        projectPage[activeProject] || emptyObject
    ),
);

export const projectLocalDataSelector = createSelector(
    projectSelector,
    project => project.localData || emptyObject,
);

export const projectDashboardSelector = createSelector(
    projectSelector,
    project => project.dashboard || emptyObject,
);

export const projectActivityLogSelector = createSelector(
    projectDashboardSelector,
    dashboard => dashboard.activityLog || emptyArray,
);

export const projectServerDataSelector = createSelector(
    projectSelector,
    project => project.serverData || emptyObject,
);

export const projectFaramValueSelector = createSelector(
    projectLocalDataSelector,
    localdata => localdata.faramValues || emptyObject,
);

export const projectUsergroupsSelector = createSelector(
    projectSelector,
    project => project.usergroups || emptyArray,
);

export const projectUsergroupListSelector = createSelector(
    projectUsergroupsSelector,
    usergroups => mapToList(
        usergroups,
        usergroup => usergroup,
    ) || emptyArray,
);

export const projectMembershipsSelector = createSelector(
    projectSelector,
    project => project.memberships || emptyArray,
);

export const projectMembershipListSelector = createSelector(
    projectMembershipsSelector,
    memberships => mapToList(
        memberships,
        membership => membership,
    ) || emptyArray,
);

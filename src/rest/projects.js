import {
    wsEndpoint,
    POST,
    PUT,
    PATCH,
    DELETE,
    commonHeaderForPost,
    p,
} from '#config/rest';

export const createUrlForProject = projectId => `${wsEndpoint}/projects/${projectId}/`;
export const createUrlForProjectJoin = projectId => `${wsEndpoint}/projects/${projectId}/join/`;
export const createUrlForProjectJoinCancel = projectId => `${wsEndpoint}/projects/${projectId}/join/cancel/`;
export const createUrlForProjectOptions = projectId => `${wsEndpoint}/project-options/?${p({ project: projectId })}`;

export const createUrlForProjectAryTemplate = projectId => `${wsEndpoint}/projects/${projectId}/assessment-template/`;

export const createUrlForProjectsOfUser = userId => (
    `${wsEndpoint}/projects/member-of/?${p({ user: userId })}`
);

export const createUrlForUserGroupProjects = id => (
    `${wsEndpoint}/projects/?${p({ user_group: id })}`
);

const projectMiniUrlFields = [
    'id',
    'title',
    'version_id',
    'role',
    'assessment_template',
    'analysis_framework',
    'regions',
];
export const urlForProjects = `${wsEndpoint}/projects/member-of/?${p({ fields: projectMiniUrlFields })}`;
export const urlForProjectCreate = `${wsEndpoint}/projects/`;
export const urlForProjectMembership = `${wsEndpoint}/project-memberships/`;
export const createUrlForUserProjectMembership = membershipId =>
    `${wsEndpoint}/project-memberships/${membershipId}/`;

export const createParamsForProjectJoin = () => ({
    method: POST,
    headers: commonHeaderForPost,
});

export const createParamsForProjectJoinCancel = () => ({
    method: POST,
    headers: commonHeaderForPost,
});

export const createParamsForProjectPatch = data => ({
    method: PUT,
    headers: commonHeaderForPost,
    body: JSON.stringify(data),
});

export const createParamsForUserProjectMembershipPatch = data => ({
    method: PATCH,
    headers: commonHeaderForPost,
    body: JSON.stringify(data),
});

export const createParamsForProjectCreate = ({ title, userGroups }) => ({
    method: POST,
    headers: commonHeaderForPost,
    body: JSON.stringify({
        title,
        userGroups,
    }),
});

export const createParamsForProjectMembershipCreate = ({ memberList }) => ({
    method: POST,
    headers: commonHeaderForPost,
    body: JSON.stringify({
        list: memberList,
    }),
});

export const createParamsForProjectDelete = () => ({
    method: DELETE,
    headers: commonHeaderForPost,
});

export const createParamsForUserProjectMembershipDelete = () => ({
    method: DELETE,
    headers: commonHeaderForPost,
});

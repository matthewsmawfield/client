import { wsEndpoint, p } from '#config/rest';

// eslint-disable-next-line import/prefer-default-export
export const createUrlForLeadFilterOptions = projectId => (
    `${wsEndpoint}/lead-options/?${p({ project: projectId })}`
);

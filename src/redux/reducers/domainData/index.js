import createReducerWithMap from '../../../utils/createReducerWithMap';

import analysisFrameworksReducers from './analysisFrameworks';
import categoryEditorsReducers from './categoryEditors';
import leadFilterReducers from './leadFilter';
import entryFilterReducers from './entryFilter';
import projectsReducers from './projects';
import regionsReducers from './regions';
import userGroupsReducers from './userGroups';
import usersReducers from './users';
import userExportsReducers from './userExports';
import commonReducers from './common';

import initialDomainData from '../../initial-state/domainData';

const reducers = {
    ...analysisFrameworksReducers,
    ...categoryEditorsReducers,
    ...leadFilterReducers,
    ...entryFilterReducers,
    ...projectsReducers,
    ...regionsReducers,
    ...userGroupsReducers,
    ...usersReducers,
    ...userExportsReducers,
    ...commonReducers,
};

const reducer = createReducerWithMap(reducers, initialDomainData);
export default reducer;
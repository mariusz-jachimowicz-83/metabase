/* @flow weak */

import MetabaseSettings from "metabase/lib/settings";

import { handleActions, createAction, createThunkAction, combineReducers } from "metabase/lib/redux";

import { SessionApi, SettingsApi } from "metabase/services";

import { loadCurrentUser } from "./user";
import { getUserIsAdmin } from "metabase/selectors/user";

export const refreshSiteSettings = createThunkAction("REFRESH_SITE_SETTINGS", () =>
    async (dispatch, getState) => {
        // public settings
        const settings = await SessionApi.properties();
        MetabaseSettings.setAll(settings);

        // also load admin-only settings, if user is an admin
        await dispatch(loadCurrentUser());
        if (getUserIsAdmin(getState())) {
            await dispatch(refreshSettingsList());
        }

        return settings;
    }
);

export const refreshSettingsList = createAction("REFRESH_SETTINGS_LIST", async () => {
    let settingsList = await SettingsApi.list();
    MetabaseSettings.setAll(collectSettingsValues(settingsList));
    return settingsList.map((setting) => {
        setting.originalValue = setting.value;
        return setting;
    });
});

const collectSettingsValues = (settingsList) => {
    let settings = {};
    for (const setting of settingsList) {
        settings[setting.key] = setting.value;
    }
    return settings;
}

const values = handleActions({
    [refreshSiteSettings]: { next: (state, { payload }) => ({ ...state, ...payload }) },
    [refreshSettingsList]: { next: (state, { payload }) => ({ ...state, ...collectSettingsValues(payload) }) },
}, {});

const settings = handleActions({
    [refreshSettingsList]: { next: (state, { payload }) => payload }
}, []);

export default combineReducers({
    values,
    settings,
})

import React from "react";

import Icon from "metabase/components/Icon";
import ActionButton from "metabase/components/ActionButton";
import Select, { Option } from "metabase/components/Select";

import DisplayOptionsPane from "./DisplayOptionsPane";

import cx from "classnames";

const getIconForParameter = (parameter) =>
    parameter.type === "category" ? "string" :
    parameter.type.indexOf("date/") === 0 ? "calendar" :
    "unknown";

const AdvancedSettingsPane = ({
    className,
    secure,
    resourceType, resourceParameters,
    embeddingParams, onChangeEmbeddingParameters,
    displayOptions, onChangeDisplayOptions,
    onSave,
}) =>
    <div className={cx(className, "rounded bordered p2 flex flex-column bg-white")} style={{ width: 320 }}>
        <Section title="Style">
            <DisplayOptionsPane
                className="pt1"
                displayOptions={displayOptions}
                onChangeDisplayOptions={onChangeDisplayOptions}
            />
        </Section>
        { secure &&
            <Section title="Parameters">
                { resourceParameters.length > 0 ?
                    <p>Which parameters can users of this embed use?</p>
                :
                    <p>This {resourceType} doesn't have any parameters to configure.</p>
                }
                {resourceParameters.map(parameter =>
                    <div className="flex align-center my1">
                        <Icon name={getIconForParameter(parameter)} className="mr2" style={{ color: "#DFE8EA" }} />
                        <h3>{parameter.name}</h3>
                        <Select
                            className="ml-auto"
                            value={embeddingParams[parameter.slug] || "disabled"}
                            onChange={(e) => onChangeEmbeddingParameters({ ...embeddingParams, [parameter.slug] : e.target.value })}
                        >
                            <Option icon="close" value="disabled">Disabled</Option>
                            <Option icon="pencil" value="enabled">Editable</Option>
                            <Option icon="lock" value="locked">Locked</Option>
                        </Select>
                    </div>
                )}
            </Section>
        }
        <div className="ml-auto">
            <ActionButton primary actionFn={onSave} activeText="Updating..." successText="Updated" failedText="Failed!">Publish</ActionButton>
        </div>
    </div>

const Section = ({ className, title, children }) =>
    <div className={cx(className, "mb4")}>
        <h3>{title}</h3>
        {children}
    </div>

export default AdvancedSettingsPane;

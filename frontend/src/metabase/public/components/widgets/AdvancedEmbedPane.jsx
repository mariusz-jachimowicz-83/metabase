/* @flow */

import React, { Component, PropTypes } from "react";

import AdvancedSettingsPane from "./AdvancedSettingsPane";
import PreviewPane from "./PreviewPane";
import EmbedCodePane from "./EmbedCodePane";
import ToggleLarge from "metabase/components/ToggleLarge";
import Parameters from "metabase/dashboard/containers/Parameters";

type Props = {
};

const AdvancedEmbedPane = ({
    pane,
    resource,
    resourceType,
    embedType,
    token,
    iframeUrl,
    siteUrl,
    secretKey,
    params,
    displayOptions,
    previewParameters,
    parameterValues,
    resourceParameters,
    embeddingParams,
    onChangeDisplayOptions,
    onChangeEmbeddingParameters,
    onChangeParameterValue,
    onChangePane,
    onSave
}: Props) =>
    <div className="flex-full flex flex-column">
        <ToggleLarge
            className="mb2"
            style={{ width: 244, height: 34 }}
            value={pane === "preview"}
            textLeft="Preview"
            textRight="Code"
            onChange={() => onChangePane(pane === "preview" ? "code" : "preview")}
        />
        <div className={"flex-full flex"}>
            <div className="flex-full flex flex-column">
                { embedType === "secure" && previewParameters.length > 0 &&
                    <div className="mt4 bordered rounded bg-white p2">
                        <h3 className="mb2">Preview Locked Parameters</h3>
                        <Parameters
                            parameters={previewParameters}
                            parameterValues={parameterValues}
                            setParameterValue={(id, value) => onChangeParameterValue(id, value)}
                        />
                    </div>
                }
                { pane === "preview" ?
                    <PreviewPane
                        className="flex-full"
                        previewUrl={iframeUrl}
                    />
                : pane === "code" ?
                    <EmbedCodePane
                        className="flex-full"
                        resource={resource}
                        resourceType={resourceType}
                        secure={embedType === "secure"}
                        iframeUrl={iframeUrl}
                        token={token}
                        siteUrl={siteUrl}
                        secretKey={secretKey}
                        params={params}
                        displayOptions={displayOptions}
                    />
                : null }
            </div>
            <div className="ml4">
                <AdvancedSettingsPane
                    resourceType={resourceType}
                    resourceParameters={resourceParameters}
                    secure={embedType === "secure"}
                    embeddingParams={embeddingParams}
                    onChangeEmbeddingParameters={onChangeEmbeddingParameters}
                    displayOptions={displayOptions}
                    onChangeDisplayOptions={onChangeDisplayOptions}
                    onSave={onSave}
                />
            </div>
        </div>
    </div>;

export default AdvancedEmbedPane;

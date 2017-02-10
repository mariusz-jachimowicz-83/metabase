/* @flow */

import React, { Component, PropTypes } from "react";
import { connect } from "react-redux";

import EmbedSettingsPane from "./EmbedSettingsPane";
import EmbedPreviewPane from "./EmbedPreviewPane";
import EmbedCodePane from "./EmbedCodePane";

import ToggleLarge from "metabase/components/ToggleLarge";
import Icon from "metabase/components/Icon";

import Parameters from "metabase/dashboard/containers/Parameters";

import { getSignedPreviewUrl, getUnsignedPreviewUrl, getSignedToken } from "metabase/public/lib/embed";

import { getSiteUrl, getEmbeddingSecretKey } from "metabase/selectors/settings";
import cx from "classnames";

type Props = {
};

type State = {
};


const mapStateToProps = (state, props) => ({
    siteUrl: getSiteUrl(state, props),
    secretKey: getEmbeddingSecretKey(state, props),
})

@connect(mapStateToProps)
export default class EmbedModalContent extends Component<*, Props, State> {
    state: State;

    constructor(props: Props) {
        super(props);
        this.state = {
            pane: "preview",
            secure: false,
            embeddingParams: props.resource.embedding_params || {},
            displayOptions: {
                theme: null,
                bordered: true
            },

            parameterValues: {},
        };
    }

    static defaultProps = {};

    handleSave = async () => {
        try {
            const { resource } = this.props;
            const { secure, embeddingParams } = this.state;
            if (secure) {
                if (!resource.enable_embedding) {
                    await this.props.onUpdateEnableEmbedding(true);
                }
                await this.props.onUpdateEmbeddingParams(embeddingParams);
            } else {
                if (!resource.public_uuid) {
                    await this.props.onCreatePublicLink();
                }
            }
        } catch (e) {
            console.error(e);
        }
    }

    getPreviewParams() {
        const { resourceParameters } = this.props;
        const { embeddingParams, parameterValues } = this.state;
        const params = {};
        for (const parameter of resourceParameters) {
            if (embeddingParams[parameter.slug] === "locked" || embeddingParams[parameter.slug] === "enabled") {
                params[parameter.slug] = (parameter.id in parameterValues) ?
                    parameterValues[parameter.id] :
                    parameter.slug.toUpperCase();
            }
        }
        return params;
    }

    render() {
        const { className, siteUrl, secretKey, resource, resourceType, resourceParameters, onClose } = this.props;
        const { pane, secure, embeddingParams, parameterValues, displayOptions } = this.state;

        const params = this.getPreviewParams();

        let iframeUrl;
        if (secure) {
            iframeUrl = getSignedPreviewUrl(siteUrl, resourceType, resource.id, params, displayOptions, secretKey);
        } else {
            iframeUrl = getUnsignedPreviewUrl(siteUrl, resourceType, resource.public_uuid, displayOptions);
        }
        const token = getSignedToken(resourceType, resource.id, params, secretKey);

        const previewParameters = resourceParameters.filter(p => embeddingParams[p.slug] === "enabled" || embeddingParams[p.slug] === "locked");

        return (
            <div
                className={cx(className, "flex flex-column p4", { "bg-brand": pane === "preview" })}
                style={{ transition: "background-color 300ms linear" }}
            >
                { onClose &&
                    <Icon
                        className="text-grey-2 text-grey-4-hover cursor-pointer absolute m2 p2 top right"
                        name="close"
                        size={24}
                        onClick={onClose}
                    />
                }
                <ToggleLarge
                    className="mb2"
                    style={{ width: 244, height: 34 }}
                    value={pane === "preview"}
                    textLeft="Preview"
                    textRight="Code"
                    onChange={(e) => this.setState({ pane: pane === "preview" ? "code" : "preview" })}
                />
                <div className={"flex-full flex"}>
                    <div className="flex-full flex flex-column">
                        { pane === "preview" ?
                            <EmbedPreviewPane
                                className="flex-full"
                                previewUrl={iframeUrl}
                            />
                        : pane === "code" ?
                            <EmbedCodePane
                                className="flex-full"
                                resource={resource}
                                resourceType={resourceType}
                                secure={secure}
                                iframeUrl={iframeUrl}
                                token={token}
                                siteUrl={siteUrl}
                                secretKey={secretKey}
                                params={params}
                                displayOptions={displayOptions}
                            />
                        : null }
                        { secure && previewParameters.length > 0 &&
                            <div className="mt4 bordered rounded bg-white p2">
                                <h3 className="mb2">Preview Locked Parameters</h3>
                                <Parameters
                                    parameters={previewParameters}
                                    parameterValues={parameterValues}
                                    setParameterValue={(id, value) => this.setState({ parameterValues: { ...parameterValues, [id]: value }})}
                                />
                            </div>
                        }
                    </div>
                    <div className="ml4">
                        <EmbedSettingsPane
                            resourceType={resourceType}
                            resourceParameters={resourceParameters}
                            secure={secure}
                            onChangeSecure={(secure) => this.setState({ secure })}
                            embeddingParams={embeddingParams}
                            onChangeEmbeddingParameters={(embeddingParams) => this.setState({ embeddingParams })}
                            displayOptions={displayOptions}
                            onChangeDisplayOptions={(displayOptions) => this.setState({ displayOptions })}
                            onSave={this.handleSave}
                        />
                    </div>
                </div>
            </div>
        );
    }
}

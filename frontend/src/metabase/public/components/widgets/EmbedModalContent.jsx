/* @flow */

import React, { Component, PropTypes } from "react";
import { connect } from "react-redux";

import SimpleEmbedPane from "./SimpleEmbedPane";
import AdvancedEmbedPane from "./AdvancedEmbedPane";

import Icon from "metabase/components/Icon";

import EmbedTypePicker from "./EmbedTypePicker";


import { getSignedPreviewUrl, getUnsignedPreviewUrl, getSignedToken } from "metabase/public/lib/embed";

import { getSiteUrl, getEmbeddingSecretKey } from "metabase/selectors/settings";
import cx from "classnames";

import type { Parameter, ParameterId } from "metabase/meta/types/Dashboard";

export type EmbeddingParams = {
    [key: string]: string
}

export type DisplayOptions = {
    theme: ?string,
    bordered: boolean
}

type Props = {
    className?: string,
    siteUrl: string,
    secretKey: string,
    resource: { id: string, public_uuid: string, embedding_params: EmbeddingParams },
    resourceType: string,
    resourceParameters: Parameter[],
    onUpdateEnableEmbedding: (enable_embedding: bool) => Promise<void>,
    onUpdateEmbeddingParams: (embedding_params: EmbeddingParams) => Promise<void>,
    onCreatePublicLink: () => Promise<void>,
    onClose: () => void
};

type State = {
    pane: "preview"|"code",
    embedType: null|"simple"|"secure",
    embeddingParams: EmbeddingParams,
    displayOptions: DisplayOptions,
    parameterValues: { [id: ParameterId]: string }
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
            embedType: null,
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
            await require("metabase/lib/promise").delay(1000);
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
            throw e;
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
        const { pane, embedType, embeddingParams, parameterValues, displayOptions } = this.state;

        const params = this.getPreviewParams();

        let iframeUrl;
        if (embedType === "secure") {
            iframeUrl = getSignedPreviewUrl(siteUrl, resourceType, resource.id, params, displayOptions, secretKey);
        } else if (embedType === "simple") {
            iframeUrl = getUnsignedPreviewUrl(siteUrl, resourceType, resource.public_uuid, displayOptions);
        }
        const token = getSignedToken(resourceType, resource.id, params, secretKey);

        const previewParameters = resourceParameters.filter(p => embeddingParams[p.slug] === "enabled" || embeddingParams[p.slug] === "locked");

        return (
            <div className="p4 flex flex-column full-height">
                <div className="flex align-center mb4">
                    <h2 className="ml-auto">
                        { embedType == null ?
                            <a onClick={() => this.setState({ embedType: null })}>Embed</a>
                        : embedType === "simple" ?
                            <a onClick={() => this.setState({ embedType: null })}>Embed -> Simple</a>
                        : embedType === "secure" ?
                            <a onClick={() => this.setState({ embedType: null })}>Embed -> Secure</a>
                        : null}
                    </h2>
                    <Icon
                        className="text-grey-2 text-grey-4-hover cursor-pointer p2 ml-auto"
                        name="close"
                        size={24}
                        onClick={onClose}
                    />
                </div>
                <div className="flex flex-full my4">
                    <div className="flex-full ml-auto mr-auto" style={{ maxWidth: 1040 }}>
                        { embedType == null ?
                            <EmbedTypePicker
                                onChangeEmbedType={(embedType) => this.setState({ embedType })}
                                resourceType={resourceType}
                            />
                        : embedType === "simple" ?
                            <SimpleEmbedPane
                                iframeUrl={iframeUrl}
                                displayOptions={displayOptions}
                                onChangeDisplayOptions={(displayOptions) => this.setState({ displayOptions })}
                            />
                        : embedType === "secure" ?
                            <AdvancedEmbedPane
                                pane={pane}
                                resource={resource}
                                resourceType={resourceType}
                                embedType={embedType}
                                token={token}
                                iframeUrl={iframeUrl}
                                siteUrl={siteUrl}
                                secretKey={secretKey}
                                params={params}
                                displayOptions={displayOptions}
                                previewParameters={previewParameters}
                                parameterValues={parameterValues}
                                resourceParameters={resourceParameters}
                                embeddingParams={embeddingParams}
                                onChangeDisplayOptions={(displayOptions) => this.setState({ displayOptions })}
                                onChangeEmbeddingParameters={(embeddingParams) => this.setState({ embeddingParams })}
                                onChangeParameterValue={(id, value) => this.setState({ ...parameterValues, [id]: value })}
                                onChangePane={(pane) => this.setState({ pane })}
                                onSave={this.handleSave}
                            />
                    : null }
                    </div>
                </div>
            </div>
        );
    }
}

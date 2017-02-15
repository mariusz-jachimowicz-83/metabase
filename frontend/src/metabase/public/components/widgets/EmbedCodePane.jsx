/* @flow */

import React, { Component, PropTypes } from "react";

import ExternalLink from "metabase/components/ExternalLink";
import CodeSample from "./CodeSample";

import { getPublicEmbedOptions, getSignedEmbedOptions, getSignTokenOptions } from "../../lib/code"

import "metabase/lib/ace/theme-metabase";

import "ace/mode-clojure";
import "ace/mode-javascript";
import "ace/mode-ruby";
import "ace/mode-html";
import "ace/mode-jsx";

import type { EmbedType, EmbeddableResource, EmbeddingParams, DisplayOptions } from "./EmbedModalContent";

type Props = {
    className: string,
    embedType: EmbedType,
    iframeUrl: string,
    token: string,
    siteUrl: string,
    secretKey: string,
    resource: EmbeddableResource,
    resourceType: string,
    params: EmbeddingParams,
    displayOptions: DisplayOptions
}

const EmbedCodePane = ({ className, embedType, iframeUrl, token, siteUrl, secretKey, resource, resourceType, params, displayOptions }: Props) =>
    <div className={className}>
        { embedType === "application" ?
            <div key="application">
                <CodeSample
                    title="Server-side Token Signing"
                    options={getSignTokenOptions({ siteUrl, secretKey, resourceType, resourceId: resource.id, params, displayOptions })}
                />
                <CodeSample
                    title="Embed Code"
                    options={getSignedEmbedOptions({ iframeUrl })}
                />
            </div>
        :
            <div key="public">
                <CodeSample
                    title="Embed Code"
                    options={getPublicEmbedOptions({ iframeUrl })}
                />
            </div>
        }

        <div className="text-centered my2">
            <h4>More <ExternalLink href="https://github.com/metabase/metabase">examples on GitHub</ExternalLink></h4>
        </div>
    </div>

// const ViewOnJWTIO = ({ className, token }) =>
//     <ExternalLink className={className} href={`https://jwt.io/#id_token=${token}`}>
//         <img src="https://jwt.io/assets/badge.svg" />
//     </ExternalLink>

export default EmbedCodePane;

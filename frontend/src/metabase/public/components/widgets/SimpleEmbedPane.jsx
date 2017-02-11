/* @flow */

import React, { Component, PropTypes } from "react";

import DisplayOptionsPane from "./DisplayOptionsPane"
import PreviewPane from "./PreviewPane"
import CodeSample from "./CodeSample"

import { getPublicEmbedOptions } from "../../lib/code"

import cx from "classnames"

type Props = {
};

const SimpleEmbedPane = ({ className, iframeUrl, displayOptions, onChangeDisplayOptions }) =>
    <div className={cx(className, "flex")}>
        <div className="flex-full flex flex-column">
            <PreviewPane className="flex-full mb2" previewUrl={iframeUrl} />
            <CodeSample options={getPublicEmbedOptions({ iframeUrl })} />
        </div>
        <DisplayOptionsPane
            className="m4"
            displayOptions={displayOptions}
            onChangeDisplayOptions={onChangeDisplayOptions}
        />
    </div>;

export default SimpleEmbedPane;

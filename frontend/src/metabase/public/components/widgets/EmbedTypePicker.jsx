/* @flow */

import React, { Component, PropTypes } from "react";

import Button from "metabase/components/Button";

import cx from "classnames"

type Props = {
};

const EmbedTypePicker = ({ className, onChangeEmbedType }: Props) =>
    <div className={cx(className, "flex layout-centered")}>
        <Button className="mr1" onClick={() => onChangeEmbedType("simple")}>Simple</Button>
        <Button onClick={() => onChangeEmbedType("secure")}>Secure</Button>
    </div>

export default EmbedTypePicker;

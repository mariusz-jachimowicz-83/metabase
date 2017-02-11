/* @flow */

import React, { Component, PropTypes } from "react";

import Icon from "metabase/components/Icon";

import cx from "classnames";

type Props = {
    className?: string,
    value: string,
    onChange: (value: string) => void,
    options: Array<{ name: string, value: string}>
}

const EmbedSelect = ({ className, value, onChange, options }: Props) =>
    <div className={cx(className, "flex")}>
        { options.map(option =>
            <div
                className={cx("flex-full flex layout-centered mx1 p1 border-bottom border-med", {
                    "border-dark": value === option.value,
                    "cursor-pointer": value !== option.value
                })}
                onClick={() => onChange(option.value)}
            >
                { option.icon && <Icon name={option.icon} className="mr1" />}
                {option.name}
            </div>
        )}
        {/* hack because border-bottom doesn't add a border to the last element :-/ */}
        <div className="hide" />
    </div>

export default EmbedSelect;

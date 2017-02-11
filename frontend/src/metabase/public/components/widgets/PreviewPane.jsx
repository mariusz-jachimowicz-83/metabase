
import React, { Component, PropTypes } from "react";

import cx from "classnames";

export default class PreviewPane extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: true
        };
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.previewUrl !== this.props.previewUrl) {
            this.setState({ loading: true })
        }
    }

    render() {
        const { className, previewUrl } = this.props;
        const { loading } = this.state;
        return (
            <div className={cx(className, "flex relative")}>
                <iframe
                    className="flex-full"
                    src={previewUrl}
                    frameBorder={0}
                    allowTransparency
                    onLoad={() => this.setState({ loading: false })}
                />
                { loading &&
                    <div className="spread bordered rounded" />
                }
            </div>
        );
    }
}

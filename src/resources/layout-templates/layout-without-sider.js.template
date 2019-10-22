import React from "react";
import { Layout } from "antd";

const { Header, Content, Footer } = Layout;

const LayoutWithoutSider = ({ name, header, children, footer }) => {
    return (
        <Layout>
            {header}
            <Layout>
                <Content>{children}</Content>
            </Layout>
            {footer}
        </Layout>
    );
};
export default LayoutWithoutSider;

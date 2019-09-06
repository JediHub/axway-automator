import React from 'react';
import PropTypes from 'prop-types';
import './TreeNode.scss';

class TreeNode extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      collapsed: props.defaultCollapsed
    };
    this.handleCollapseToggle = this.handleCollapseToggle.bind(this);
  }

  handleCollapseToggle(...args) {
    this.setState({ collapsed: !this.state.collapsed });
    if (this.props.onClick) {
      this.props.handleCollapseToggle(...args);
    }
  }

  render() {
    const {
      collapsed = this.state.collapsed,
      className = '',
      itemClassName = '',
      treeNodeClassName = '',
      childrenClassName = '',
      nodeClassName = '',
      nodeLabel,
      children,
      defaultCollapsed,
      onClick,
      ...rest
    } = this.props;

    let arrowClassName = 'tree-node_arrow';
    let noArrowClassName = 'tree-node_noarrow';
    let containerClassName = 'tree-node_children';
    if (collapsed) {
      arrowClassName += ' tree-node_arrow-collapsed';
      containerClassName += ' tree-node_children-collapsed';
    }

    const arrow = (
      <div
        {...rest}
        className={className + ' ' + arrowClassName}
        onClick={this.handleCollapseToggle}
      />
    );

    const noArrow = (
      <div className={noArrowClassName} />
    );

    const node = (
      <span
        className={'tree-node_node ' + nodeClassName}
        onClick={onClick}
      >
        {nodeLabel}
      </span>
    );

    return (
      <div className={'tree-node ' + treeNodeClassName}>
        <div className={'tree-node_item ' + itemClassName}>
          {children ? arrow : noArrow}
          {node}
        </div>
        <div className={containerClassName + ' ' + childrenClassName}>
          {collapsed ? null : children}
        </div>
      </div>
    );
  }
}

TreeNode.propTypes = {
  collapsed: PropTypes.bool,
  defaultCollapsed: PropTypes.bool,
  handleCollapseToggle: PropTypes.func,
  onClick: PropTypes.func,
  nodeLabel: PropTypes.node.isRequired,
  className: PropTypes.string,
  itemClassName: PropTypes.string,
  childrenClassName: PropTypes.string,
  treeNodeClassName: PropTypes.string,
  nodeClassName: PropTypes.string
}

export default TreeNode;

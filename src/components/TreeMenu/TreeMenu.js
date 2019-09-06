import React from 'react';
import TreeNode from '../TreeNode/TreeNode';
import './TreeMenu.scss';

export default class TreeMenu extends React.Component {
    render() {
        return (
            <div>
                <TreeNode defaultCollapsed nodeLabel={'Basic'} nodeClassName={'gg icon-GG-graph'}>
                    <TreeNode defaultCollapsed nodeLabel={'Content'} nodeClassName={'gg icon-GG-envelope2'}>
                        <TreeNode defaultCollapsed nodeLabel={'App1'} nodeClassName={'gg icon-GG-envelope2'}>
                            <TreeNode defaultCollapsed nodeLabel={'JOB1'} nodeClassName={'gg icon-GG-file-empty'} />
                            <TreeNode defaultCollapsed nodeLabel={'JOB2'} nodeClassName={'gg icon-GG-file-empty'} />
                        </TreeNode>
                        <TreeNode defaultCollapsed nodeLabel={'App2'} nodeClassName={'gg icon-GG-envelope2'}>
                            <TreeNode defaultCollapsed nodeLabel={'SAVE_DB'} nodeClassName={'gg icon-GG-file-empty'} />
                            <TreeNode defaultCollapsed nodeLabel={'STOP_DB'} nodeClassName={'gg icon-GG-file-empty'} />
                        </TreeNode>
                    </TreeNode>
                    <TreeNode defaultCollapsed nodeLabel={'Archives'} nodeClassName={'gg icon-GG-envelope2'}>
                        <TreeNode defaultCollapsed nodeLabel={'Arch1'} nodeClassName={'gg icon-GG-envelope2'}>
                            <TreeNode defaultCollapsed nodeLabel={'App1'} nodeClassName={'gg icon-GG-envelope2'}>
                                <TreeNode defaultCollapsed nodeLabel={'JOB1'} nodeClassName={'gg icon-GG-file-empty'} />
                                <TreeNode defaultCollapsed nodeLabel={'JOB2'} nodeClassName={'gg icon-GG-file-empty'} />
                            </TreeNode>
                            <TreeNode defaultCollapsed nodeLabel={'App1'} nodeClassName={'gg icon-GG-envelope2'}>
                                <TreeNode defaultCollapsed nodeLabel={'JOB1'} nodeClassName={'gg icon-GG-file-empty'} />
                                <TreeNode defaultCollapsed nodeLabel={'JOB2'} nodeClassName={'gg icon-GG-file-empty'} />
                            </TreeNode>
                        </TreeNode>
                    </TreeNode>
                </TreeNode>
            </div>

        );
    }
}

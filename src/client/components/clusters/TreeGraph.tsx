import React, { useState, useEffect } from 'react';

import { Group } from '@visx/group';
import { hierarchy, Tree } from '@visx/hierarchy';
import { LinearGradient } from '@visx/gradient';
import { LinkHorizontal, } from '@visx/shape';
import Stack from '@mui/material/Stack';

import { TreeNode } from './../../../shared/types';
import { fetchClusterTree } from '../../utils/ajax';
import EndpointList from './EndpointList';
import Splash from './../common/Splash';
// import { useLightTheme } from ''


const defaultMargin = { top: 30, left: 30, right: 30, bottom: 70 }; // TODO reconciliate this with component Tree attribute size

export default function TreeGraph({
  width,
  height,
  margin = defaultMargin,
  useLightTheme,
  setUseLightTheme,
}: {
  width: number;
  height: number;
  margin?: { top: number; right: number; bottom: number; left: number };
}) {
  const [trees, setTreeGraphData] = useState<TreeNode | null>(null);
  const [endpoints, setEndPoints] = useState<{ clusterName: string, methodName: string, endpointList: string[] }>({ clusterName: 'No cluster selected', methodName: 'No method selected', endpointList: [] });

  const treeWidth = (width * 0.6) - (24 * 3);
  const treeHeight = height - (24 * 2);

  // Fetch request zone
  useEffect(() => {
    fetchClusterTree(setTreeGraphData);
  }, []);

  return (<>
    {trees === null && <Splash />}
    {trees !== null &&
      <Stack direction='row' spacing={2} padding={3}>
        <svg width={treeWidth} height={treeHeight} style={{ flexGrow: 1, filter: useLightTheme ? 'drop-shadow(10px 10px 7px #b3b3b3)' : 'drop-shadow(10px 10px 7px #F12C0C)' }} >
          <LinearGradient id='links-gradient' from='#fd9b93' to='#fe6e9e' />
          <rect width={treeWidth} height={(treeHeight)} rx={14} fill='#272b4d'/>
          <Group top={margin.top} left={margin.left}>
            <Tree
              root={hierarchy(trees, (d) => d.children)}
              size={[treeHeight - 56, treeWidth - 35]}
              separation={(a, b) => (a.parent === b.parent ? 2 : 100) / a.depth}
            >
              {(tree) => (
                <Group top={0} left={0}>
                  {tree.links().map((link, i) => (
                    <LinkHorizontal
                      key={i}
                      data={link}
                      stroke='rgb(3, 136, 252)'
                      strokeWidth='1'
                      fill='none'
                    />
                  ))}
                  {tree.descendants().map((node, key) => {
                    const width = 60;
                    const height = 20;
                    const top: number = node.x;
                    const left: number = node.y;

                    return (
                      <Group top={top} left={left} key={key}>
                        {node.depth === 0 && (
                          <circle
                            r={12}
                            fill="url('#links-gradient')"
                          />
                        )}
                        {node.depth > 0 && node.depth !== 3 && (
                          <rect
                            height={height}
                            width={width}
                            y={-height / 2}
                            x={-width / 2}
                            fill='#272b4d'
                            stroke={node.data.children ? '#03c0dc' : '#26deb0'}
                            strokeWidth={1}
                            strokeDasharray={node.data.children ? '0' : '2,2'}
                            strokeOpacity={node.data.children ? 1 : 0.6}
                            rx={node.data.children ? 0 : 10}
                            onClick={() => {
                              if (node.depth == 2) {

                                //To see what cluster this method belongs to , we have to access node.data.parent.name
                                //To get the name of the method, we have to access node.data.name
                                const clusterName = node.parent !== null ? node.parent.data.name : '';
                                const methodName = node.data.name;

                                if (node.data.children) node.data.children.sort((a, b) => a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1);

                                const endpointList: TreeNode[] = node.data.children ? node.data.children : [];

                                setEndPoints({ clusterName: clusterName, methodName: methodName, endpointList: endpointList.map(node => node.name) });
                              }
                            }}
                          />
                        )}
                        {node.depth !== 3 && (
                          <text
                            dy='.33em'
                            fontSize={9}
                            fontFamily='Arial'
                            textAnchor='middle'
                            style={{ pointerEvents: 'none' }}
                            fill={node.depth === 0 ? '#fc0345' : node.children ? 'white' : '#fc0345'}
                          >
                            {node.data.name}
                          </text>
                        )}
                      </Group>
                    );
                  })}
                </Group>
              )}
            </Tree>
          </Group>
        </svg>
        <EndpointList  {...endpoints} width={width - treeWidth - (24 * 3)} height={treeHeight} />
      </Stack>
    }
  </>);
}

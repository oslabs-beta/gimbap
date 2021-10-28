import React, { useState, useEffect } from 'react';
import { Group } from '@visx/group';
import { hierarchy, Tree } from '@visx/hierarchy';
import { LinearGradient } from '@visx/gradient';
import { pointRadial } from 'd3-shape';
import useForceUpdate from './useForceUpdate';
import LinkControls from './LinkControls';
import getLinkComponent from './getLinkComponent';
import { fetchClusterTree } from '../../../utils/ajax';
import { Cluster } from './../../../../shared/types';
import EndpointList from './EndpointList';
import Stack from '@mui/material/Stack';



interface TreeNode {
  name: string;
  isExpanded?: boolean;
  children?: TreeNode[];
}

const defaultMargin = { top: 30, left: 30, right: 30, bottom: 70 };

export type LinkTypesProps = {
  width: number;
  height: number;
  margin?: { top: number; right: number; bottom: number; left: number };
};

export default function TreeGraph({
  width: totalWidth,
  height: totalHeight,
  margin = defaultMargin,
}: LinkTypesProps) {
  const [layout, setLayout] = useState<string>('cartesian');
  const [orientation, setOrientation] = useState<string>('horizontal');
  const [linkType, setLinkType] = useState<string>('diagonal');
  const [stepPercent, setStepPercent] = useState<number>(0.5);
  const [trees, setTreeGraphData] = useState<Cluster[] | null>([]);
  const [endpoints, setEndPoints] = useState<{clusterName: string, methodName: string, endpointList: string[]}>({clusterName: 'No cluster selected', methodName: 'No method selected', endpointList: []});
  const [clusters, setClusters] = useState<Cluster | null>([]);
  const forceUpdate = useForceUpdate();

  const innerWidth = totalWidth - margin.left - margin.right;
  const innerHeight = totalHeight - margin.top - margin.bottom;

  let origin: { x: number; y: number };
  let sizeWidth: number;
  let sizeHeight: number;

  // Fetch request zone
  useEffect(()=>{
    fetchClusterTree(setTreeGraphData);
  },[]);

  const data = trees;
  if (layout === 'polar') {
    origin = {
      x: innerWidth / 2,
      y: innerHeight / 2,
    };
    sizeWidth = 2 * Math.PI;
    sizeHeight = Math.min(innerWidth, innerHeight) / 2;
  } else {
    origin = { x: 0, y: 0 };
    if (orientation === 'vertical') {
      sizeWidth = innerWidth;
      sizeHeight = innerHeight;
    } else {
      sizeWidth = innerHeight;
      sizeHeight = innerWidth;
    }
  }

  const LinkComponent = getLinkComponent({ layout, linkType, orientation });

  return totalWidth < 10 ? null : (
    <div>
      <LinkControls
        layout={layout}
        orientation={orientation}
        linkType={linkType}
        stepPercent={stepPercent}
        setLayout={setLayout}
        setOrientation={setOrientation}
        setLinkType={setLinkType}
        setStepPercent={setStepPercent}
      />
      <Stack direction="row" spacing={2}>
        <svg width={totalWidth} height={totalHeight} style={{flexGrow: 1}}>
          <LinearGradient id="links-gradient" from="#fd9b93" to="#fe6e9e" />
          <rect width={totalWidth} height={(totalHeight)} rx={14} fill="#272b4d" />
          <Group top={margin.top} left={margin.left}>
            <Tree
              root={hierarchy(data, (d) => (d.isExpanded ? null : d.children))}
              size={[sizeWidth, sizeHeight]}
              separation={(a, b) => (a.parent === b.parent ? 2 : 100) / a.depth}
            >
              {(tree) => (
                <Group top={origin.y} left={origin.x}>
                  {tree.links().map((link, i) => (
                    <LinkComponent
                      key={i}
                      data={link}
                      percent={stepPercent}
                      stroke="rgb(3, 136, 252)"
                      strokeWidth="1"
                      fill="none"
                    />
                  ))}
                  {tree.descendants().map((node, key) => {
                    const width = 40;
                    const height = 20;

                    let top: number;
                    let left: number;
                    if (layout === 'polar') {
                      const [radialX, radialY] = pointRadial(node.x, node.y);
                      top = radialY;
                      left = radialX;
                    } else if (orientation === 'vertical') {
                      top = node.y;
                      left = node.x;
                    } else {
                      top = node.x;
                      left = node.y;
                    }

                    return (
                      <Group top={top} left={left} key={key}>
                        {node.depth === 0 && (
                          <circle
                            r={12}
                            fill="url('#links-gradient')"
                            onClick={() => {
                              node.data.isExpanded = !node.data.isExpanded;
                              forceUpdate();
                            }}
                          />
                        )}
                        {node.depth > 0 && node.depth !== 3 &&(
                          <rect
                            height={height}
                            width={width}
                            y={-height / 2}
                            x={-width / 2}
                            fill="#272b4d"
                            stroke={node.data.children ? '#03c0dc' : '#26deb0'}
                            strokeWidth={1}
                            strokeDasharray={node.data.children ? '0' : '2,2'}
                            strokeOpacity={node.data.children ? 1 : 0.6}
                            rx={node.data.children ? 0 : 10}
                            onClick={() => {
                              if(node.depth == 2) {
                                console.log(node.parent.data.name);
                                //To see what cluster this method belongs to , we have to access node.data.parent.name
                                //To get the name of the method, we have to access node.data.name
                                const clusterName = node.parent.data.name;
                                const methodName = node.data.name
                                const endpointList = node.data.children.sort((a, b) => {
                                  let fa = a.name.toLowerCase(),
                                      fb = b.name.toLowerCase();

                                  if (fa < fb) {
                                      return -1;
                                  }
                                  if (fa > fb) {
                                      return 1;
                                  }
                                  return 0;
                                })

                                setEndPoints({clusterName: clusterName, methodName: methodName, endpointList: endpointList});
                              }
                              //node.data.isExpanded = !node.data.isExpanded;
                              forceUpdate();
                            }}
                          />
                        )}
                        {node.depth !== 3 &&(
                        <text
                          dy=".33em"
                          fontSize={9}
                          fontFamily="Arial"
                          textAnchor="middle"
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
        <EndpointList sx={{ width: 1/2}} endpoints={endpoints}/>
      </Stack>
    </div>
  );
}

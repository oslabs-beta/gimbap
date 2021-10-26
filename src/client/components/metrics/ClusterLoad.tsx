import React, { useState, useEffect } from 'react';

import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Splash from './../common/Splash';

import { Cluster, LoadData } from './../../../shared/types';
import { fetchClusters, fetchClusterLoadData } from './../../utils/ajax';
import { drawerWidth } from './../common/NavigationBar';
import useWindowDimensions from './../../hooks/useWindowDimensions';
import ChipSelector from './../common/ChipSelector';
import LoadGraph from './LoadGraph';

export default function ClusterLoad({
  isNavBarOpen,
  useLightTheme
}: {
  isNavBarOpen: boolean;
  useLightTheme: boolean;
}): JSX.Element {

  const { width: windowWidth } = useWindowDimensions();

  const [clusters, setClusters] = useState<Cluster[] | null>(null);
  const [selectedClusters, setSelectedClusters] = useState<number[]>([]); // indices in clusters
  const [clustersLoadData, setClustersLoadData] = useState<{ [key: number]: LoadData }>(Object.create(null));

  // load all clusters on component mounting
  useEffect(() => {
    fetchClusters(setClusters);
  }, []);

  // load route load data on user selecting an endpoint
  useEffect(() => {
    if (!clusters) return;

    for (const index of selectedClusters) {
      if (!clustersLoadData[index]) {
        fetchClusterLoadData(index, setClustersLoadData);
      }
    }
  }, [clusters, clustersLoadData, selectedClusters]);

  // will be undefined if data has not finished transferring from back-end
  const selectedLoadData: { [key: number]: LoadData | undefined } = selectedClusters.map((index: number) => clustersLoadData[index]);

  const clusterLabels = clusters ? clusters.map((_, i: number) => `Cluster ${i}`) : [];

  return (<>
    {!clusters && <Splash />}
    {clusters &&
      <Stack id='cluster-load' sx={{ padding: 2 }}>
        <Typography variant='h4' color='textPrimary'>Cluster Load Graphs</Typography>
        <Typography variant='body1' color='textPrimary'>Average number of server calls to a particular cluster per 24-hour time period.</Typography>
        <Typography variant='body1' color='textPrimary' mt={4}>Select clusters to view graphs.</Typography>

        <ChipSelector
          itemLabels={clusterLabels}
          selected={selectedClusters}
          setSelected={setSelectedClusters}
          label='Clusters'
        />

        {Object.entries(selectedLoadData).map(([index, loadData]) => {
          if (!loadData) return <Splash />;

          const i: number = parseInt(index);
          const label = clusterLabels[i];

          return (<LoadGraph
            key={index}
            useLightTheme={useLightTheme}
            height={400}
            width={windowWidth - (isNavBarOpen ? drawerWidth : 0) - 100}
            loadData={loadData}
            label={label}
          />);
        })}
      </Stack>
    }
  </>);
}

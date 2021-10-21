import React, { useState, useEffect } from 'react';

import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Splash from './../common/Splash';

import { Cluster, LoadData } from './../../../shared/types';
import { fetchClusters, fetchClusterLoadData } from './../../utils/ajax';
import ChipSelector from './../common/ChipSelector';
import LoadGraph from './LoadGraph';

export default function ClusterLoad({
  useLightTheme
}: {
  useLightTheme: boolean;
}): JSX.Element {

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

  // TODO when user has graph selected, but data is not available, show splash

  const selectedLoadData: { [key: number]: LoadData } = Object.entries(clustersLoadData).reduce((selected, [index, loadData]) => {
    if (selectedClusters.includes(parseInt(index))) selected[index] = loadData;
    return selected;
  }, Object.create(null));

  const clusterLabels = clusters ? clusters.map((_, i: number) => `Cluster ${i}`) : [];

  return (<>
    {!clusters && <Splash />}
    {clusters &&
      <Stack sx={{ padding: 2 }}>
        <Typography variant='h4'>Cluster Load Graphs</Typography>
        <Typography variant='body1'>Average number of server calls to a particular cluster per 24-hour time period.</Typography>
        <Typography variant='body1' mt={4}>Select clusters to view graphs.</Typography>

        <ChipSelector
          itemLabels={clusterLabels}
          selected={selectedClusters}
          setSelected={setSelectedClusters}
          label='Clusters'
        />

        {Object.entries(selectedLoadData).map(([index, loadData]) => {
          const i: number = parseInt(index);
          const label = clusterLabels[i];

          return (<LoadGraph
            key={index}
            useLightTheme={useLightTheme}
            height={340}
            width={420}
            loadData={loadData}
            label={label}
          />);
        })}
      </Stack>
    }
  </>);
}

import React, { useState } from 'react';

import { Cluster } from './../../../shared/types';
import Splash from './../common/Splash';
import LoadGraph from './LoadGraph';


export default function ClusterLoad() {
  const [clusters, setClusters] = useState<Cluster[] | null>(null);

  // TODO make fetch request

  return (<>
    {!clusters && <Splash />}
    {/*clusters && <LoadGraph />*/}
  </>);
}

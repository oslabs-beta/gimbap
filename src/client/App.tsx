import React, {useState} from 'react';

import { Page } from './types';

import NavigationBar from './components/common/NavigationBar';
import Clusters from './components/clusters/Clusters';
import Metrics from './components/metrics/Metrics';
import Documentation from './components/documentation/Documentation';

export default function App() {

  const [page, setPage] = useState<Page>(Page.Clusters);
  const [pageHeader, setPageHeader] = useState<string>('Temp Page Header');

  return(
    <div id="app">
      <NavigationBar pageHeader={pageHeader} setPage={setPage} setPageHeader={setPageHeader} />
      {page === Page.Clusters && <Clusters />}
      {page === Page.Metrics && <Metrics />}
      {page === Page.Documentation && <Documentation />}
    </div>
  );
}

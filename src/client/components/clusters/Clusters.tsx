import React, {useState, useEffect} from 'react';
import TreeGraph from './treegraph/TreeGraph';
//import ParentSize from '@visx/responsive/lib/components/ParentSize';


export default function Clusters(props) {
  const {useLightTheme} = props;
  const [dimensions, setDimensions] = useState({
    height: document.documentElement.clientHeight,
    width: document.documentElement.clientWidth,
  });

  //Resize the window and update the state
  useEffect(() => {
    function handleResize() {
      setDimensions({
        height: document.documentElement.clientHeight,

        width: document.documentElement.clientWidth
      });
    }
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  });

  return(
    //<ParentSize>{({ width, height }) => <TreeGraph width={width} height={height} />}</ParentSize>
    <TreeGraph width={dimensions.width * 0.60} height={(dimensions.height * 0.90)} useLightTheme={useLightTheme}/>
    // routes scroll
  );

}

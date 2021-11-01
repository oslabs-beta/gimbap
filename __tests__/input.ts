import React from 'react';
import { fetchRouteLoadData } from '../src/client/utils/ajax';
import { Route, LoadData } from '../src/shared/types';

describe('Test validation for input', () => {
    test('Try to validate chip selector with non character HTTP methods', async() => {
        const route: Route = { method: 'XAEA-12', endpoint: '/api/fun' };
        const index = 1;
        const loadData: LoadData = [[1,1],[2,3]];
        const setRoutesLoadData: React.Dispatch<React.SetStateAction<{ [key: number]: LoadData }>> = ()=>{
            console.log(loadData);
        };
        const test = await fetchRouteLoadData(route,index,setRoutesLoadData);
        expect(test).toBe(undefined);
        //const loadData = await fetchRouteLoadData()
    });

});
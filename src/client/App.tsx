import GimbapFrontEnd from './components/frontend/GimbapFrontEnd';
import React, { useState, useCallback, useEffect } from 'react';
import SignUp from './components/SignUp/SignUp';


export default function App() {
    const [mongo,setMongo] = useState(false);
    return(
        <>
            {mongo === true ?<GimbapFrontEnd /> : <SignUp start={setMongo}/>}
        </>
    )

}
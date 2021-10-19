import React from "react";


// Create a reusable typescript Fetch Request with detached error handler
async function request<TResponse>(
  url: string,
  config: RequestInit = {}
): Promise<TResponse> {
  const response = await fetch(url, config);
  return await response.json();
}

// handle the errors outside of the requests
(async () => {
  try {
    const data = await request('/api/clusters');
  }
  catch (error) {
    console.error(error);
  }
});

// fetch all cluster dendogram data
const getAllDendogramData = request('/api/clusters', {
  method: 'GET',
  headers: {'Accept': 'application/json'}
});

// Fetch specific cluster data
const getClusterData = request('api/clusters/:name', {
  method: 'POST',
  headers: {'Content-Type': 'application/json',
            'Accept': 'application/json'}
});


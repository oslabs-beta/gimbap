import React from "react";

function MyComponent() {
  const [dimensions, setDimensions] = React.useState({
    height: document.documentElement.clientHeight,

    width: document.documentElement.clientWidth,
  });

  React.useEffect(() => {
    function handleResize() {
      setDimensions({
        height: document.documentElement.clientHeight,

        width: document.documentElement.clientWidth
      });
    }

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  });

  return (
    <div>
      Rendered at {dimensions.width} x {dimensions.height}
    </div>
  );
}

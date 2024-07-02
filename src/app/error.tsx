"use client";
import React from "react";

function Error() {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div>
      <div>Error</div>
      <button onClick={handleRefresh}>Refresh</button>
    </div>
  );
}

export default Error;

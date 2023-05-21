import React from "react";

type ProgressBarProps = {
  completed: number;
  total: number;
};

const ProgressBar: React.FC<ProgressBarProps> = ({ completed, total }) => {
  const containerStyles = {
    height: 16,
    width: "100%",
    backgroundColor: "#e0e0de",
    borderRadius: 50,
  };

  const fillerStyles = {
    height: "100%",
    width: `${(completed / total) * 100}%`,
    backgroundColor: "#008000",
    borderRadius: "inherit",
    transition: "width 1s ease-in-out",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontWeight: "bold",
  };

  return (
    <div style={containerStyles}>
      <div style={fillerStyles}>
        {`${Math.round((completed / total) * 100)}%`}
      </div>
    </div>
  );
};

export default ProgressBar;
